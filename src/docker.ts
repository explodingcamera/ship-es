import { spawn } from 'node:child_process';
import archiver from 'archiver';
import { generateDockerFile } from './container/dockerfile';

interface ContainerRuntimeOptions {
	containerClient: 'docker' | 'podman' | 'nerdctl';
	containerFlags?: string[];
	kanikoFlags?: string[];

	registry: string;
	username: string;
	password: string;
}

export interface ContainerBuildOptions extends ContainerRuntimeOptions {
	imageName: string;
	tag: string | string[];
	cwd: string;

	// packages to be installed for building (alpine)
	buildDependencies?: string[];

	// packages to be installed for running the application (alpine)
	prodDependencies?: string[];
}

export const builtContainer = async (
	opts: ContainerBuildOptions,
): Promise<Error | undefined> => {
	try {
		const dockerFlags = ['--interactive'];
		if (opts.containerFlags) dockerFlags.push(...opts.containerFlags);

		const kanikoFlags = [
			'--reproducible',
			`--context`,
			`tar://stdin`,
			`--destination=${opts.imageName}`,
		];
		if (opts.kanikoFlags) kanikoFlags.push(...opts.kanikoFlags);

		const docker = spawn('docker', [
			'run',
			...dockerFlags,
			'gcr.io/kaniko-project/executor:v1.7.0',
			...kanikoFlags,
		]);

		console.log(
			[
				'run',
				...dockerFlags,
				'gcr.io/kaniko-project/executor:v1.7.0',
				...kanikoFlags,
			].join(' '),
		);

		docker.stdout.pipe(process.stdout);
		docker.stderr.pipe(process.stderr);
		const archive = archiver('tar', {
			gzip: true,
		});

		archive.pipe(docker.stdin);
		archive.directory(opts.cwd, false);

		const { buildDependencies, prodDependencies } = opts;
		const dockerfile = generateDockerFile({
			buildDependencies,
			prodDependencies,
		});

		archive.append(dockerfile, { name: 'Dockerfile' });
		await archive.finalize();
	} catch (error: unknown) {
		if (error instanceof Error) return error;
		return new Error('unknown error while building container');
	}
};

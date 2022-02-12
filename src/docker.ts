import { spawn } from 'node:child_process';
import archiver from 'archiver';
import { generateDockerFile } from './container/dockerfile';
import { resolve } from 'path/posix';
import { mkdir, readFile, rm, rmdir, unlink } from 'node:fs/promises';
import { join } from 'node:path';

import writeFileAtomic from 'write-file-atomic';

interface ContainerRuntimeOptions {
	containerClient: 'docker' | 'podman' | 'nerdctl';
	containerFlags?: string[];
	kanikoFlags?: string[];

	// either the path to a docker config file or url, username & password
	registryAuth:
		| undefined
		| string
		| {
				registry: 'dockerhub' | 'ghcr' | string;
				registryUsername: string;
				registryPassword: string;
		  };
}

export interface ContainerBuildOptions extends ContainerRuntimeOptions {
	imageName: string;
	tag: string | string[];
	cwd: string;

	outDir: string;

	// build the container but don't push it to an regestry
	noPush?: boolean;

	// packages to be installed for building (alpine)
	buildDependencies?: string[];

	// packages to be installed for running the application (alpine)
	prodDependencies?: string[];
}

export const builtContainer = async (
	opts: ContainerBuildOptions,
): Promise<Error | undefined> => {
	const outDir = resolve(opts.cwd, opts.outDir);

	// we have to mount the config to our container. https://github.com/GoogleContainerTools/kaniko/issues/1650 would be great to prevent this
	const dockerFolder = join(outDir, './.docker');

	try {
		const dockerConfig = await generateDockerConfg(opts);
		await writeFileAtomic(join(outDir, '.gitignore'), '*');
		await mkdir(dockerFolder, { recursive: true });
		await writeFileAtomic(join(dockerFolder, 'config.json'), dockerConfig);

		const dockerFlags = [
			'--interactive',
			`-v`,
			`${dockerFolder}:/kaniko/.docker`,
			`-e`,
			`DOCKER_CONFIG=/kaniko/.docker/`,
		];
		if (opts.containerFlags) dockerFlags.push(...opts.containerFlags);

		const kanikoFlags = [
			'--reproducible',
			`--verbosity`,
			`trace`,
			`--context`,
			`tar://stdin`,
			`--destination=${opts.imageName}`,
		];
		if (opts.kanikoFlags) kanikoFlags.push(...opts.kanikoFlags);
		if (opts.noPush) kanikoFlags.push(`--no-push`);

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
		archive.directory(join(outDir, './dist'), false);

		const { buildDependencies, prodDependencies } = opts;
		const dockerfile = generateDockerFile({
			buildDependencies,
			prodDependencies,
		});

		archive.append(dockerfile, { name: 'Dockerfile' });

		await archive.finalize();
		docker.on('close', async () => {
			await rm(dockerFolder, { recursive: true });
		});
	} catch (error: unknown) {
		await rm(dockerFolder, { recursive: true });
		if (error instanceof Error) return error;
		return new Error('unknown error while building container');
	}
};

const generateDockerConfg = async (opts: ContainerBuildOptions) => {
	if (typeof opts.registryAuth === 'object') {
		let { registry } = opts.registryAuth;
		if (registry === 'docker.io') registry = 'https://index.docker.io/v1/';
		if (registry === 'ghcr') registry = 'ghcr.io';
		const base64Key = Buffer.from(
			`${opts.registryAuth.registryUsername}:${opts.registryAuth.registryPassword}`,
		).toString('base64');

		return JSON.stringify({
			auths: {
				[registry]: {
					auth: base64Key,
				},
			},
		});
	}

	let path = '';
	if (opts.registryAuth) path = resolve(opts.cwd, opts.registryAuth);
	if (!opts.registryAuth) {
		if (!process.env.HOME) throw new Error("can't detect docker config");
		path = join(process.env.HOME, './.docker/config.json');
	}

	try {
		const file = await readFile(path);
		return file;
	} catch (_: unknown) {
		throw new Error(`can't detect docker config at ${path}`);
	}
};

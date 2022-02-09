import { build } from 'esbuild';
import { join } from 'node:path';
import { readJson } from './utils/read';
import micromatch from 'micromatch';

import { PackageJson } from 'type-fest';
import { mkdir } from 'node:fs/promises';
import writeFile from 'write-file-atomic';
import { exec as _exec } from 'node:child_process';
import { promisify } from 'node:util';

export const exec = promisify(_exec);

export interface BundleParams {
	cwd: string;
	outDir: string;
	release: boolean;
	external?: string[];
	static?: string[];
	entryPoint: string;
	npmClient?: string;
}

export const npmI = async (cwd: string, npmClient = 'npm') => {
	try {
		await exec(`${npmClient} install`, {
			cwd,
			encoding: null,
		});
	} catch (e: unknown) {
		if (e instanceof Error) return e;
		return new Error('unknown error while installing dependencies');
	}
};

export const generatePkg = (pkg: PackageJson, externals?: string[]): string => {
	const dependencies: PackageJson.Dependency = {};

	if (externals?.length) {
		const deps = Object.entries(pkg.dependencies ?? {});
		const devDeps = Object.entries(pkg.devDependencies ?? {});

		for (const ex of externals) {
			let dep = deps.find(([k]) => k === ex || micromatch.isMatch(k, ex));
			if (!dep)
				dep = devDeps.find(([k]) => k === ex || micromatch.isMatch(k, ex));
			if (dep) dependencies[dep[0]] = dep[1];
		}
	}

	const newPkg = {
		name: pkg.name,
		version: pkg.version,
		private: true,
		type: pkg.type ?? 'module',
		main: 'index.js',
		dependencies,
		resolutions: pkg.resolutions,
	};
	return JSON.stringify(newPkg);
};

export const bundleProject = async (params: BundleParams) => {
	const pkg = await readJson<PackageJson>(join(params.cwd, './package.json'));
	if (!pkg) return new Error('no package.json in working directory');

	const outDir = join(params.cwd, params.outDir);
	await mkdir(outDir, { recursive: true });
	await writeFile(join(outDir, 'package.json'), generatePkg(pkg));
	await npmI(outDir, params.npmClient);

	// const res = await build({
	// 	absWorkingDir: params.cwd,
	// 	outdir: join(outDir, "dist"),
	// });

	// console.log(res);
};

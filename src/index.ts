import { build } from 'esbuild';
import writeFile from 'write-file-atomic';
import micromatch from 'micromatch';
import { PackageJson } from 'type-fest';

import { join, resolve } from 'node:path';
import { mkdir } from 'node:fs/promises';

import { readJson } from './utils/read';
import { npmI } from './utils/npm-i';
import { checkFileExists } from './utils/file-exists';

export interface BundleParams {
	cwd: string;
	outDir: string;
	release: boolean;
	external?: string[];
	static?: string[];
	entryPoint: string;
	npmClient?: string;
	watch?: boolean;
}

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

	const entrypoint = resolve(params.cwd, params.entryPoint);
	if (!(await checkFileExists(entrypoint)))
		return new Error(`entrypoint '${params.entryPoint}' does not exist`);

	const res = await build({
		entryPoints: [entrypoint],
		watch: Boolean(params.watch),
		absWorkingDir: params.cwd,
		outfile: join(outDir, 'dist', './index.js'),
		format: 'esm',
		target: 'node17',
		bundle: true,
		platform: 'node',
	});

	const { errors, warnings } = res;
	if (warnings.length) warnings.forEach(w => console.warn(w));
	if (errors.length) errors.forEach(e => console.warn(e));
};

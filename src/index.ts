import { build } from 'esbuild';
import { join } from 'node:path';
import { readJson } from './utils/read';
import micromatch from 'micromatch';

import { PackageJson } from 'type-fest';

export interface BundleParams {
	workingDirectory: string;
	outputDirectory: string;
	release: boolean;
	externs?: string[];
	static?: string[];
	entryPoint?: string[];
}

export const generatePkg = (
	pkg: PackageJson,
	externals?: string[],
): PackageJson => {
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

	return {
		name: pkg.name,
		version: pkg.version,
		private: true,
		type: pkg.type,
		main: 'index.js',
		dependencies,
	};
};

export const bundleProject = async (params: BundleParams) => {
	const pkg = await readJson<PackageJson>(
		join(params.workingDirectory, './package.json'),
	);
	if (!pkg) return new Error('no package.json in working directory');
	const newPgk = generatePkg(pkg);
	console.log(newPgk);

	// const res = await build({
	// 	absWorkingDir: params.workingDirectory,
	// 	outdir: params.outputDirectory,
	// });

	// console.log(res);
};

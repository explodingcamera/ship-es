import { build } from 'esbuild';

interface EsBuildOptions {
	entryPoints: string[];
	dir: string;
	minify: boolean;
}

export const esbuild = async ({ entryPoints, dir, minify }: EsBuildOptions) => {
	const res = await build({
		entryPoints,
		absWorkingDir: dir,
		allowOverwrite: false,
		minify,
	});
};

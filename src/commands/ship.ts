import yargs from 'yargs';
import { builtContainer } from '../docker.js';
import { bundleProject } from '../index.js';
import { BundleOptions, Command, ContainerOptions } from './index.js';

export interface ShipCommand extends BundleOptions, ContainerOptions, Command {}

export const shipHandler = async (
	args: yargs.ArgumentsCamelCase<ShipCommand>,
) => {
	const res = await bundleProject({
		npmClient: args.npmClient,
		outDir: args.outDir!,
		release: Boolean(args.release),
		cwd: args.cwd!,
		entryPoint: args.entryPoint,
		external: args.external,
		static: args.static,
	});
	if (res instanceof Error) throw res;

	const res2 = await builtContainer({
		cwd: args.cwd!,
		imageName: args.imageName!,
		tag: args.tag || 'latest',
	});
	if (res2 instanceof Error) throw res2;
};

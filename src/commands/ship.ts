import yargs from 'yargs';
import { bundleProject } from '../index.js';
import { BundleOptions, Command, ContainerOptions } from './index.js';

export interface ShipCommand extends BundleOptions, ContainerOptions, Command {}

export const shipHandler = (args: yargs.ArgumentsCamelCase<ShipCommand>) => {
	const res = bundleProject({
		npmClient: args.npmClient,
		outDir: args.outDir!,
		release: Boolean(args.release),
		cwd: args.cwd!,
		entryPoint: args.entryPoint,
		external: args.external,
		static: args.static,
	});
	if (res instanceof Error) throw res;
};

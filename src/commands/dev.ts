import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import yargs from 'yargs';
import { BundleOptions, Command } from '.';
import { bundleProject } from '..';
import { checkFileExists } from '../utils/file-exists';

export interface DevCommand extends BundleOptions, Command {
	watch?: boolean;
}

export const devHandler = async (
	args: yargs.ArgumentsCamelCase<DevCommand>,
) => {
	const res = await bundleProject({
		npmClient: args.npmClient,
		outDir: args.outDir!,
		release: Boolean(args.release),
		cwd: args.cwd!,
		entryPoint: args.entryPoint,
		external: args.external,
		static: args.static,
		watch: args.watch,
	});
	if (res instanceof Error) throw res;

	const file = resolve(args.cwd!, args.outDir!, 'dist', './index.js');
	if (!(await checkFileExists(file)))
		throw new Error('unknown error: no bundle output');

	spawn('node', [file], {
		stdio: 'inherit',
	});
};

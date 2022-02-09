// yargs is currently installed from git due to critical bug fixes not being on npm yet
// https://github.com/yargs/yargs/pull/2105
import { join } from 'node:path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { bundleProject } from '.';

interface ShipOptions {
	[x: string]: unknown;
	'image-name': string;
	push: boolean;
	tag?: string[];
	release?: boolean;
	'set-version'?: string;
	externs?: string[];
	static?: string[];
	'entry-point'?: string[];
	'out-dir': string;
	cwd: string;
}

void yargs(hideBin(process.argv))
	.scriptName('ship-es')
	.command<ShipOptions>({
		command: '$0 <image-name>',
		aliases: ['ship'],
		describe: 'build project & deploy docker container',
		builder: yargs =>
			yargs
				.positional('image-name', {
					type: 'string',
					desc: 'docker image name',
					demandOption: true,
				})
				.option('push', {
					alias: ['p'],
					default: false,
					type: 'boolean',
					desc: 'push to the container registry after building the image',
				})
				.option('cwd', {
					type: 'string',
					default: process.cwd(),
					hidden: true,
				})
				.option('out-dir', {
					type: 'string',
					default: join(process.cwd(), '.ship-es'),
				})
				.option('tag', {
					type: 'string',
					array: true,
					desc: 'Override tag, can be used multiple times',
				})
				.option('release', {
					type: 'boolean',
					desc: 'Tag with `stable`, `x.x.x`, `x.x` and `x` (based on your `package.json`). Can be overridden with --version',
				})
				.option('set-version', {
					type: 'string',
					desc: 'Override version used by release',
				})
				.option('external', {
					type: 'string',
					array: true,
					desc: 'Externalize Dependency',
				})
				.option('static', {
					type: 'string',
					array: true,
					desc: 'Static Folder/Files',
				})
				.option('entry-point', {
					type: 'string',
					array: true,
					desc: 'override entrypoint',
				})
				.implies('set-version', 'release'),
		handler: async opts => {
			const res = bundleProject({
				outputDirectory: opts.outDir,
				release: Boolean(opts.release),
				workingDirectory: opts.cwd,
				entryPoint: opts.entryPoint,
				externs: opts.externs,
				static: opts.static,
			});
			if (res instanceof Error) throw res;
		},
	})
	.option('verbose', {
		alias: 'v',
		type: 'boolean',
		description: 'Run with verbose logging',
	})
	.strict()
	.help()
	.parse();

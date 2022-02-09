// yargs is currently installed from git due to critical bug fixes not being on npm yet
// https://github.com/yargs/yargs/pull/2105
import { spawn } from 'node:child_process';
import { normalize, resolve } from 'node:path';
import yargs, { Options } from 'yargs';
import { hideBin } from 'yargs/helpers';
import { bundleProject } from '.';

interface BundleOptions {
	'entry-point': string;
	'out-dir'?: string;
	external?: string[];
	static?: string[];
	'npm-client'?: string;
}
const bundleOptions: Record<string, Options> = {
	'out-dir': {
		type: 'string',
		default: './.ship-es',
	},
	external: {
		type: 'string',
		array: true,
		desc: 'Externalize Dependency',
	},
	static: {
		type: 'string',
		array: true,
		desc: 'Static Folder/Files',
	},
	'npm-client': {
		type: 'string',
		default: 'npm',
		desc: 'override npm client, should be available in the current PATH',
	},
};

interface ContainerOptions {
	push?: boolean;
	tag?: string[];
	release?: boolean;
	'set-version'?: string;
	'image-name'?: string;
}

const containerOptions: Record<string, Options> = {
	tag: {
		type: 'string',
		array: true,
		desc: 'Override tag, can be used multiple times',
	},
	release: {
		type: 'boolean',
		desc: 'Tag with `stable`, `x.x.x`, `x.x` and `x` (based on your `package.json`). Can be overridden with --version',
	},
	'set-version': {
		type: 'string',
		desc: 'Override version used by release',
		implies: 'release',
	},
	push: {
		alias: ['p'],
		default: false,
		type: 'boolean',
		desc: 'push to the container registry after building the image',
	},
};

interface ShipCommand extends BundleOptions, ContainerOptions {
	[x: string]: unknown;
	cwd: string;
}

void yargs(hideBin(process.argv))
	.scriptName('ship-es')
	.command<{ 'entry-point': string }>({
		command: 'dev <entry-point>',
		describe: 'run code locally',
		handler: args => {
			const file = resolve(
				process.cwd(),
				normalize(args.entryPoint || 'index.ts'),
			);

			spawn('node', ['--loader=ts-node/esm', '--no-warnings', file], {
				stdio: 'inherit',
			});
		},
	})
	.command<ShipCommand>({
		command: '$0 <entry-point> <image-name>',
		aliases: ['ship'],
		describe: 'build project & deploy docker container',
		builder: yargs =>
			yargs
				.options({
					cwd: {
						type: 'string',
						default: process.cwd(),
						hidden: true,
					},
					...containerOptions,
					...bundleOptions,
				})
				.positional('image-name', {
					type: 'string',
					desc: 'docker image name',
					demandOption: true,
				})
				.positional('entry-point', {
					type: 'string',
					demandOption: true,
					desc: 'entrypoint',
				}),
		handler: async opts => {
			const res = bundleProject({
				npmClient: opts.npmClient,
				outDir: opts.outDir!,
				release: Boolean(opts.release),
				cwd: opts.cwd,
				entryPoint: opts.entryPoint,
				external: opts.external,
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

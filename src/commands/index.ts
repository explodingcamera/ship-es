import { Options } from 'yargs';

export interface Command {
	[x: string]: unknown;
	cwd?: string;
}

export interface ContainerOptions {
	push?: boolean;
	tag?: string[];
	release?: boolean;
	'set-version'?: string;
	'image-name'?: string;
}

export interface BundleOptions {
	'entry-point': string;
	'out-dir'?: string;
	external?: string[];
	static?: string[];
	'npm-client'?: string;
}

export const cwdOptions: Record<string, Options> = {
	cwd: {
		type: 'string',
		default: process.cwd(),
		hidden: true,
	},
};

export const containerOptions: Record<string, Options> = {
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

export const bundleOptions: Record<string, Options> = {
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

// yargs is currently installed from git due to critical bug fixes not being on npm yet
// https://github.com/yargs/yargs/pull/2105
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

interface ShipOptions {
	[x: string]: unknown;
	imageName?: string;
	noPush?: boolean;
	tag?: string[];
	release?: boolean;
	setVersion?: string;
	externs?: string[];
	static?: string[];
	entryPoint?: string[];
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
				})
				.option('no-push', {
					alias: ['p', 'dry'],
					type: 'boolean',
					desc: "don't push to a registry after building the image",
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
		handler: opts => {
			console.log(`${JSON.stringify(opts.imageName)}`);
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

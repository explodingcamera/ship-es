// yargs is currently installed from git due to critical bug fixes not being on npm yet
// https://github.com/yargs/yargs/pull/2105
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { bundleOptions, containerOptions, cwdOptions } from './commands';
import { DevCommand, devHandler } from './commands/dev';
import { ShipCommand, shipHandler } from './commands/ship';

void yargs(hideBin(process.argv))
	.scriptName('ship-es')
	.command<DevCommand>({
		command: 'dev <entry-point>',
		describe: 'run code locally',
		builder: yargs =>
			yargs
				.options({
					...cwdOptions,
					...bundleOptions,
					watch: {
						type: 'boolean',
						desc: 'restart on file change',
						default: false,
					},
				})
				.positional('entry-point', {
					type: 'string',
					demandOption: true,
					desc: 'entrypoint',
				}),
		handler: devHandler,
	})
	.command<ShipCommand>({
		command: '$0 <entry-point> <image-name>',
		aliases: ['ship'],
		describe: 'build project & deploy docker container',
		builder: yargs =>
			yargs
				.options({
					...cwdOptions,
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
		handler: shipHandler,
	})
	.option('verbose', {
		alias: 'v',
		type: 'boolean',
		description: 'Run with verbose logging',
	})
	.strict()
	.help()
	.parse();

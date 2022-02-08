import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

void yargs(hideBin(process.argv))
	.scriptName('ship-es')
	.help()
	.demandCommand(1)
	.parse();

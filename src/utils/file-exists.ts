import { constants } from 'fs';
import { access } from 'fs/promises';

export async function checkFileExists(file: string) {
	return access(file, constants.F_OK)
		.then(() => true)
		.catch(() => false);
}

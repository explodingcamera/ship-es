import { exec as _exec } from 'node:child_process';
import { promisify } from 'node:util';
export const exec = promisify(_exec);

export const npmI = async (cwd: string, npmClient = 'npm') => {
	try {
		await exec(`${npmClient} install`, {
			cwd,
			encoding: null,
		});
	} catch (e: unknown) {
		if (e instanceof Error) return e;
		return new Error('unknown error while installing dependencies');
	}
};

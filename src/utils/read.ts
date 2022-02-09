import { readFile } from 'fs/promises';

export const read = async (path: string): Promise<string | undefined> => {
	try {
		return await readFile(path, 'utf8');
	} catch (_: unknown) {
		return undefined;
	}
};

export const readJson = async <T extends Record<string, any>>(
	path: string,
): Promise<T | undefined> => {
	const data = await read(path);
	try {
		return data ? JSON.parse(data) : undefined;
	} catch (_: unknown) {
		return undefined;
	}
};

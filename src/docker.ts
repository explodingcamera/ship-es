export interface ContainerBuildOptions {
	imageName: string;
	tag: string | string[];
	cwd: string;
}

export const generateDockerFile = ({
	buildDependencies, // default should maybe be ^make gcc g++ python3`
	prodDependencies,
}: {
	buildDependencies?: string[];
	prodDependencies?: string[];
}) => `
# This stage installs our modules
FROM mhart/alpine-node:12
WORKDIR /app
COPY package.json package-lock.json ./

${
	buildDependencies
		? `RUN apk add --no-cache ${buildDependencies.join(' ')}`
		: ''
}

RUN npm ci --prod

# Then we copy over the modules from above onto a slim image
FROM mhart/alpine-node:slim-12

RUN apk add --no-cache ${prodDependencies ? prodDependencies.join(' ') : ''}

tini
ENTRYPOINT ["/sbin/tini", "--"]

WORKDIR /app
COPY --from=0 /app .
COPY . .
CMD ["node", "index.js"]
`;

export const builtContainer = async (
	_opts: ContainerBuildOptions,
): Promise<Error | undefined> => {
	try {
		// const docker = new Docker(opts.docker);
		// await docker.pull('gcr.io/kaniko-project/executor:v1.7.0', {
		// 	authconfig: { serveraddress: 'gcr.io' },
		// });
		// const container = await docker.createContainer({
		// 	Image: 'gcr.io/kaniko-project/executor:v1.7.0',
		// 	Cmd: ['--context', 'tar://stdin', '--destination', 'asdf/asdf'],
		// 	AttachStdin: true,
		// 	AttachStdout: true,
		// 	AttachStderr: true,
		// 	Tty: false,
		// 	// OpenStdin: true,
		// 	// StdinOnce: false,
		// 	// Volumes: {},
		// });
		// const stream = await container.attach({
		// 	stream: true,
		// 	stdin: true,
		// });
		// const res = tar.c(
		// 	{
		// 		cwd: opts.cwd,
		// 		gzip: true,
		// 	},
		// 	['./'],
		// );
		// res.pipe(stream);
		// container.attach(
		// 	{ stream: true, stdout: true, stderr: true },
		// 	(err, stream) => {
		// 		container.modem.demuxStream(stream, process.stdout, process.stderr);
		// 	},
		// );
		// await container.start();
		// await container.wait();
		// stream.end();
		// process.exit();
	} catch (error: unknown) {
		if (error instanceof Error) return error;
		return new Error('unknown error while building container');
	}
};

import tar from 'tar';
import Docker, { DockerOptions } from 'dockerode';

export interface DockerClientOptions {
	docker?: DockerOptions;
}

export interface ContainerBuildOptions extends DockerClientOptions {
	imageName: string;
	tag: string;
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

export const builtContainer = async (opts: ContainerBuildOptions) => {
	const docker = new Docker(opts.docker);

	const container = await docker.createContainer({
		Image: 'gcr.io/kaniko-project/executor:v1.7.0',
	});

	const stream = await container.start({ hijack: true, stdin: true });
	const res = await tar.c(
		{
			cwd: opts.cwd,
			gzip: true,
		},
		['./'],
	);

	res.pipe(stream);

	docker.modem.demuxStream(stream, process.stdout, process.stderr);
};

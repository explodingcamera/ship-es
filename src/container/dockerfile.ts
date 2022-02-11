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

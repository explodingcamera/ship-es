# ship-es <a href="https://www.npmjs.com/package/ship-es"><img src="https://img.shields.io/npm/v/ship-es?style=flat&colorA=000000&colorB =000000"/></a>

> Quickly bundle, containerize and deploy JavaScript and TypeScript server-side projects

`ship-es` enables you to quickly build your `node.js` code and deploy it as a tiny docker image, all with a single command and no required configuration.
Great for anything from Webservers to Chatbots.

# setup

`ship-es` works without any configuration by default.

```bash
# create new node.js project
$ pnpm init && pnpm i -D ship-es

# write code
$ echo "console.log('hello world')" > index.ts

# run your project locally
$ pnpx ship-es dev ./index.ts

# push your code to a container registry (in this case docker.io)
$ pnpx ship-es ship ./index.ts explodingcamera/myproject
```

> using pnpm is reccommended. You can substiture this for your package manager of choice, e.g `npm` or `yarn`

Below, we've provided a simple GitHub Workflow file to automatically build new commits pushed to your `main` branch and push them as a container to GitHub's Container Registry.

## CI/CD

Ship-es doesn't depend on any platform specific code. Just either `docker`, `podman` or `nerdctl` needs to be installed.

### GitHub Actions

`.github/workflows/deploy.yml`

```yaml
name: Deploy

# We want this to run on all commits to `main`
on:
  push:
    branches:
      - main

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      # Install node.js
      - uses: actions/setup-node@v2
        with:
          node-version: "17"

      # Install pnpm, our recommended package manager (will increase speed by a lot)
      - uses: pnpm/action-setup@v2.1.0
        with:
          version: 6.0.2

      # Authenticate with container registry
      - uses: docker/login-action@v1
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      # Build & push container image
      - name: Deploy
        run: |
          pnpm install
          pnpx ship-es ./index.ts ghcr.io/username/project --push
```

## configuration

To customize your deployment there are variety of options:

- `--push` Push the image to your container registry after building it

- **versioning**\
   When using these flags, `ship-es` will by default use the version number you provide in the package.json file located in your current working directory.

  - `--tag`: Override Tag, can be used multiple times
  - `--release` Tag with `stable`, `x.x.x`, `x.x` and `x` (based on your `package.json`)
  - `--verison`: Override version used by release
    <br/>
    <br/>

- **bundling**
  - `--external`: By default, `ship-es` bundles all of your packages into a single file to minimize their filesize and impove compatibility and start-up-performance. This might lead to issues with packages that access external files or depend on native code. To use these, add them using the `--external` flag (can be specfied multiple times and supports glob patterns). **Only packages marked as external will be included in your generated image!**
  - `--static`: To include specific folders in the final build (like a `public/` folder with static assets), add these using `--static ./public`.

## api

`ship-es` was build to also be used programatically by other projects as a base. Documentation on this will follow soon.

## Related Projects

- [snowstorm](https://github.com/explodingcamera/snowstorm) - The lightning-fast and minimalist React Tool
- [fnkit (soon to be release)](https://github.com/explodingcamera/fnkit) - The serverless experience with servers (based on `ship-es`)

## Tools used by ship-es

`ship-es` is not build to be a catch-all solution for complex deployment pipelines, rather it is a simple starting point and alternative to the huge amount of boilerplate code required to deploy a simple project. Below are the libraries `ship-es` uses internally that you could also use to build more complex setups:

- [kaniko](https://github.com/GoogleContainerTools/kaniko) - A userspace Dockerfile build-tool
- [esbuild](https://github.com/evanw/esbuild) - A JavaScript/Typescipt bundler/minifier written in Go

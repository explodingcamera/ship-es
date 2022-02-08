# ship-es (currently Work-in-Progress)

> Quickly bundle, containerize and deploy JavaScript and TypeScript server-side projects

Ship-es enables your team to quickly build your `node.js` code and deploy it as a tiny docker image, all with a single command and no required configuration.

# setup

`Ship-es` works without any configuration by default.
To run it, authenticate with your docker registry (e.g `$ docker login ghcr.io`) and run `$ npx ship-es ghcr.io/org/project`.

Below, we've provided a simple GitHub Workflow file to automatically build new commits pushed to your `main` branch and push them as a container to GitHub's Container Registry.

## CI/CD

```yaml
name: Release
on:
  push:
    branches:
      - main
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "17"
      - name: Deploy
        run: |
          npm install
          npx ship-es ghcr.io/org/project
```

## configuration

To customize your deployment there are variety of options:

- **versioning**
  When using these flags, `ship-es` will by default use the version number you provide in the package.json file located in your current working directory.

  - `--tag`: Override Tag, can be used multiple times
  - `--release` Tag with `stable`, `x.x.x`, `x.x` and `x` (based on your `package.json`)
  - `--verison`: Override version used by release

- **bundling**
  - By default, `ship-es` bundles all of your external packages into a single file to minimize their filesize and impove compatibility and start-up-performance. This might lead to issues with packages that access external files or depend on native code. To use these, add them using the `--external` flag: `--external esbuild`.
  - To include specific folders in the final build (like a `public/` folder with static assets), add these using `--static ./public`.
  - To find your applications entrypoint, `ship-es` first looks at your `package.json` for `main` and `module` fields, then at files in your current directory. To override this, you can use `--entry-point server/index.ts`

## api

`ship-es` was build to also be used programatically by other projects as a base. Documentation on this will follow soon.

## Tools used by ship-es

`ship-es` is not build to be a catch-all solution for complex deployment pipelines, rather it is a simple starting point and alternative to the huge amount of boilerplate code required to deploy a simple project. Below are the libraries `ship-es` uses internally that you could also use to build more complex setups:

- [kaniko](https://github.com/GoogleContainerTools/kaniko) - A userspace Dockerfile build-tool
- [esbuild](https://github.com/evanw/esbuild) - A JavaScript/Typescipt bundler/minifier written in Go

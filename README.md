# ship-es (currently Work-in-Progress)

> Quickly bundle, containerize and deploy JavaScript and TypeScript server-side projects

Ship-es enables your team to quickly build your `node.js` code and deploy it as a docker image, all with a single command and no required configuration.

# setup

`Ship-es` works without any configuration by default.
To run it, authenticate with your docker registry (e.g `$ docker login ghcr.io`) and run `$ ship-es ghcr.io/org/project`.

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

## flags

To customize your deployment there are variety of flags:

- **versioning**
  When using these flags, `ship-es` will by default use the version number you provide in the package.json file located in your current working directory.

  - `--verison`: Override Version
  - `--tag`: Override Tag, can be used multiple times

  - `--release` Tag with `stable`, `x.x.x`, `x.x`, `x`
  - `--nightly`: Tag with `nightly`

## Tools used by ship-es

`ship-es` is not build to be a catch-all solution for complex deployment pipelines, rather it is a simple starting point and alternative to the huge amount of boilerplate code required to deploy a simple project. Below are the libraries `ship-es` uses internally that you could also use to build more complex setups:

- [kaniko](https://github.com/GoogleContainerTools/kaniko) - A userspace Dockerfile build-tool
- [esbuild](https://github.com/evanw/esbuild) - A JavaScript/Typescipt bundler/minifier written in Go

## Development

There are several convenience npm tasks:

* `build` => cleans the `dist` directory, runs webpack, and drops the build into the `dist` directory
* `lint` => lints the `src` and `test` directory
* `test` => runs the tests

## Releasing
Use `npm run version <major|minor|patch>`. This runs:
 - installs dependencies via `yarn` so builds are version locked and reproducible
 - tests
 - linter
 - builds the dist/
 - adds dist/ to git
 - commits and tags a new version
 - pushes the branch and the tag to github

If you'd prefer to manually tag add the `--no-git-tag-version` flag.

See npm's docs for more information. https://docs.npmjs.com/cli/version

After versioning, publish to npm.


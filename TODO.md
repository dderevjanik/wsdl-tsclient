# Todo

- ~~CLI: Add more logs (check [swagger-codegen](https://swagger.io/tools/swagger-codegen/))~~
- ~~CLI: Add param `--failOnError`~~
- ~~CLI: Add `--quiet`~~
- ~~CLI: Add `--verbose`~~
- ~~CLI: Add colors, also detect if its possible to use colors, respect `--no-colors` flag ([supports-colors](https://www.npmjs.com/package/supports-color)~~
- ~~CLI: Add param to overwrite existing files `-r`~~
- ~~CLI: Use blob for generating several clients at once~~
- Generator: Possible to generate client from URL
- ~~Generator: Generate client name from wsdl filename~~
- ~~Generator: Blacklist several properties, e.g. `targetNsAlias` (Add them as jsdoc to interface?)~~
- Generator: Add more metada for properties (e.g. `xsd:number`, `minlength`, `maxlength`)
- ~~Generator: Don't add `jsdoc` to property which references another type~~
- ~~Engine: Option to generate only defintiions~~
- ~~Engine: Generate `index.ts` file with imported definitions and client~~
- ~~Project: Split `Generator` into `Parser` and `Generator`~~
- Project: Include Docker image
- Project: Add more strict TSC option
- Project: Add eslint
- Project: Add more sophisticate test
- Project: Try [Renovate](https://www.whitesourcesoftware.com/free-developer-tools/renovate)
- ~~Project: Add license~~

## NodeJS CLI Apps best practices

https://github.com/lirantal/nodejs-cli-apps-best-practices

- [ ] 1.7 Zero configuration
- [ ] 6.1 Trackable errors
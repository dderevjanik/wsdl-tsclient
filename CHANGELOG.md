# Changelog

All notable changes to this project will be documented in this file.

## [1.8.0](https://github.com/dderevjanik/wsdl-tsclient/compare/1.7.1...v1.8.0) (2025-01-12)


### Features

* new parameter --useWsdlTypeNames to generate interface names from wsdl type names ([db94bcc](https://github.com/dderevjanik/wsdl-tsclient/commit/db94bcc47e204d8c887cdecc59a1732f20c9bfe6))


### Maintenance

* add release please with provenance ([49dc863](https://github.com/dderevjanik/wsdl-tsclient/commit/49dc86324cd946a07250334292e94f41ba355333))
* update release ([ac61d24](https://github.com/dderevjanik/wsdl-tsclient/commit/ac61d245b4ee9dd076732ea46e89a4d1e1aad5c2))
* update setup-node ([60758af](https://github.com/dderevjanik/wsdl-tsclient/commit/60758af3695ae04c34410c073ba6fdc7e0d858a3))

## [1.7.0] - 2024-07-15

- [feat(cli): add option for modelPropertyNaming](https://github.com/dderevjanik/wsdl-tsclient/commit/8670d29a8f98815a74d442595b7d7d3ebdb5388c) `--modelPropertyNaming=` 

## [1.6.0] - 2024-07-02

- Fix for code generation types not matching what node-soap produces by @nahidakbar in https://github.com/dderevjanik/wsdl-tsclient/pull/54
- fix for insensitive names and use of prefix and suffix by @vekexasia in https://github.com/dderevjanik/wsdl-tsclient/pull/46
- Reduce constraints on "soap" version by @mike-marcacci in https://github.com/dderevjanik/wsdl-tsclient/pull/77
- Fix products test by @icholy in https://github.com/dderevjanik/wsdl-tsclient/pull/65
- Handle namespaced primitive types by @icholy in https://github.com/dderevjanik/wsdl-tsclient/pull/79
- ESlint fixes plus other minor improvements by @svandriel in https://github.com/dderevjanik/wsdl-tsclient/pull/82
- Fixed: Output message without nested element defaulted to request type by @svandriel in https://github.com/dderevjanik/wsdl-tsclient/pull/83
- Bugfix: move development-only dependencies to devDependencies by @svandriel in https://github.com/dderevjanik/wsdl-tsclient/pull/85
- Make tsc invocation (during tests) work on windows as well by @svandriel in https://github.com/dderevjanik/wsdl-tsclient/pull/88

## [1.5.0] - 2024-04-16

- Project: Update soap dependency to 1.0.0 [#73](https://github.com/dderevjanik/wsdl-tsclient/pull/73) by @taylorreece
- ParseAndGenerate: Add optional `options` parameter all methods by @ZimGil

## [1.4.0] - 2022-04-27

- Fix issue with self recursive WSDL types [#39](https://github.com/dderevjanik/wsdl-tsclient/pull/39) by @mtranter
- Fix issue with `quiet` option not working properly
- Project: Updated several npm packages
- Project: Added eslint
- Project: Added test for typechecking generated wsdl clients [#19](https://github.com/dderevjanik/wsdl-tsclient/pull/19)
- Project: Add more jsdoc to `parseAndGenerate` and `parsedWsdl`
- ParseAndGenerate: Support for `colors`, `verbose` and `queit` options (before it was only possible through CLI)
- Docs: Mention `basicAuth` in `README.md`

## [1.3.1] - 2021-07-01

- Project: Updated several npm packages
- Parser: Fixed issue while finding name for sub-definition, which has same name as parent definition, fixes [#16](https://github.com/dderevjanik/wsdl-tsclient/issues/16)
- Generator: Sanitize method, param and property names (e.g. names with `-`), fixes [#16](https://github.com/dderevjanik/wsdl-tsclient/issues/16) [#18](https://github.com/dderevjanik/wsdl-tsclient/issues/18)

## [1.2.0] - 2021-06-26

- CLI: Add option for `maxRecursiveDefinitionName`, default `64`
- CLI: Add option for `caseInsensitiveNames`, default `false`
- Parser: Warn user if recursive definition name exceed `32`
- Parser: Option for `caseInsensitiveNames`, fix [#12](https://github.com/dderevjanik/wsdl-tsclient/pull/12) by @jakethagle
- Generator: Fix incorrect case

## [1.1.4] - 2021-05-10

- Parser: Fix `sourceName` for definitions
- Parser: Add warn logs when parsing `ComplexType` as `any`
- Parser: Partial options for `parse` function
- Generator: Partial options for `generate` function
- More meaningful source code comments

## [1.1.3] - 2021-05-03

- Fix cyclic error when parsing `ComplexType`. Now generates `any` type
- Fix problem with duplicated imports (importing same definition for client/service/port)

## [1.1.2] - 2021-05-01

- Fix wrong generated callback result
- Parser: Improved message for cyclic errors
- Parser: Improved message for finding non-collision definition name

## [1.1.1] - 2021-04-20

- Fix wrong AsyncFunction return's type generation #10
- Fix Ports importing bad definition filename
- Fix generated Port's method names

## [1.1.0] - 2021-04-17

- Engine: Is possible to pass URL to WSDL (with `http://` or `https://` prefix)
- Generator: Fix problem with generating import paths on Windows
- Parser: Pefix `targetNSAlias` and `targetNamespace` with `@`
- Parser: Parse input/output with `parts` only
- Parser: Better error reports for cyclic error
- Parser: Add verbose logs for parsing Service,Port,Method and Definitons
- Project: Add tests for generating clients from wsdl and checking Definitions
- CLI: Reworked to support more `yargs` features
- CLI: Show number of errors occured
- CLI: Detect `NO_COLOR` and `DEBUG` environment variables

## [1.0.1] - 2021-03-21

- Engine: Reworked engine completely by separating `Parser` and `Generator` logic
- Engine: `targetNSAlias` and `targetNamespace` is included in defition jsdoc instead of properties
- Engine:  Generator now generates Client interface based on wsdl name to avoid namespace merging
- Engine:  Support color logs (green for info, red for errors)
- Engine: `Write` logs are printed before file is saved
- Engine: Support for `modelNamePrefix` and `modelNameSuffix`
- Parser: Sanitize definition names by striping reserved characters (e.g. `:`)
- Parser: Definition's jsdoc includes sourcename of definition
- Generator: Generates `index.ts` with all re-exported definitions, ports, services and client
- CLI: Fixed glob
- CLI: Generating client to `outputDir/{wsdlFilename}` directory
- CLI: `--quiet` flag for suppressing all logs
- CLI: `--verbose` flag for verbose logs
- CLI: `--no-color` flag for turning off colourful logs
- CLI: `--emitDefinitionsOnly` flag to generate only Defintions files (no Ports, Service nor Clients)
- CLI: `--modelNamePrefix` and `--modelNameSuffix`
- Project: Updated README  by adding section about how to use generated client

## [0.3.5] - 2021-03-10

- Project: Fix path to dist sources #8 by @cobraz

## [0.3.4] - 2021-03-10

- Fix problem with generated methods that includes javascript keywords as param names

## [0.3.3] - 2021-03-09

- Project: Add typescript declaration #3 by @cobraz

## [0.3.2] - 2021-03-04

- CLI: Add `version` and `help` params
- Project: Add MIT license
- Project: Add minimum node engine (base on node-soap)

## [0.3.1] - 2021-03-03

- CLI: Add support for glob pattern
- Generator: Add support for generating named client

## [0.2.0] - 2021-03-01

- Generator: Use camelcase for generating definitions, filenames and function params
- CLI: Replace `-i` with `WSDL`

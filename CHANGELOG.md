# Changelog

All notable changes to this project will be documented in this file.

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
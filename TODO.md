# Todo

- [ ] CLI: Add more logs (check [swagger-codegen](https://swagger.io/tools/swagger-codegen/))
- [ ] CLI: Add param `--failOnError`
- [ ] CLI: Add param to overwrite existing files `-r`
- [x] CLI: Use blob for generating several clients at once
- [ ] Generator: Generate client name from wsdl filename
- [ ] Generator: Blacklist several properties, e.g. `targetNsAlias` (Add them as jsdoc to interface?)
- [ ] Generator: Add more metada for properties (e.g. `xsd:number`, `minlength`, `maxlength`)
- [ ] Generator: Don't add `jsdoc` to property which references another type
- [ ] Project: Split `Generator` into `Parser` and `Generator`
- [ ] Project: Add more strict TSC option
- [ ] Project: Add eslint
- [ ] Project: Add more sophisticate test
- [ ] Project: Try [Renovate](https://www.whitesourcesoftware.com/free-developer-tools/renovate)
- [x] Project: Add license
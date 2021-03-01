# WSDL-TSCLIENT

Generate typescript [soap client](https://www.npmjs.com/package/soap) with typescript definitons from WSDL file.

This library is using [ts-morph](https://ts-morph.com/) for generate typescript code.

## Install

```sh
npm i wsdl-tsclient
```

or install it with `-g` to have CLI globally available.

```sh
npm i -g wsdl-tsclient
```

## Usage

this command will generate tsclient from wsdl file to `./generated/soap-client`.

### Using CLI

`wsdl-tsclient -in ./soap.wsdl -o ./generated/soap.wsdl`

### Programmatically

```javascript
import { generateClient } from "wsdl-tsclient";

generateClient("./path/to/wsdl.wsdl", "./generated/soap-client");
```

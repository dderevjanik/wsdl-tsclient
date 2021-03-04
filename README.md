# WSDL TSClient

[![travis-status](https://travis-ci.org/dderevjanik/wsdl-tsclient.svg?branch=master)](https://travis-ci.org/dderevjanik/wsdl-tsclient)
[![npm-version](https://img.shields.io/npm/v/wsdl-tsclient)](https://npmjs.com/package/wsdl-tsclient)

Generate [soap client](https://www.npmjs.com/package/soap) with typescript definitons from WSDL file.

This library is using [ts-morph](https://www.npmjs.com/package/ts-morph) for generate typescript code and [node-soap](https://github.com/vpulim/node-soap) for runtime.

## Install

```sh
npm i wsdl-tsclient
```

or install it with `-g` to have CLI globally available.

```sh
npm i -g wsdl-tsclient
```

## Usage

### Using CLI

`wsdl-tsclient ./soap.wsdl -o ./generated`

`wsdl-tsclient ./resources/**/*.wsdl -o ./generated` - using glob

```bash
Version: 0.3.1
Usage: wsdl-tsclient WSDL_PATH -o OUT_DIR

Example: wsdl-tsclient file.wsdl -o ./generator/client

        WSDL_PATH       path to your wsdl file(s)
        -o              output dir
```

### Programmatically

```javascript
import { generateClient } from "wsdl-tsclient";

generateClient("MyWsdlClient", "./path/to/wsdl.wsdl", "./generated/soap-client");
```

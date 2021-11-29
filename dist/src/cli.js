#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var yargs_1 = __importDefault(require("yargs"));
var path_1 = __importDefault(require("path"));
var logger_1 = require("./utils/logger");
var index_1 = require("./index");
var package_json_1 = __importDefault(require("../package.json"));
var conf = (0, yargs_1.default)(process.argv.slice(2))
    .version(package_json_1.default.version)
    .usage("wsdl-tsclient [options] [path]")
    .example("", "wsdl-tsclient file.wsdl -o ./generated/")
    .example("", "wsdl-tsclient ./res/**/*.wsdl -o ./generated/")
    .demandOption(["o"])
    .option("o", {
    type: "string",
    description: "Output directory",
})
    .option("version", {
    alias: "v",
    type: "boolean",
})
    .option("emitDefinitionsOnly", {
    type: "boolean",
    description: "Generate only Definitions",
})
    .option("modelNamePreffix", {
    type: "string",
    description: "Prefix for generated interface names",
})
    .option("modelNameSuffix", {
    type: "string",
    description: "Suffix for generated interface names",
})
    .option("caseInsensitiveNames", {
    type: "boolean",
    description: "Case-insensitive name while parsing definition names"
})
    .option("maxRecursiveDefinitionName", {
    type: "number",
    description: "Maximum count of definition's with same name but increased suffix. Will throw an error if exceed",
})
    .option("quiet", {
    type: "boolean",
    description: "Suppress logs",
})
    .option("verbose", {
    type: "boolean",
    description: "Print verbose logs",
})
    .option("no-color", {
    type: "boolean",
    description: "Logs without colors",
}).argv;
// Logger section
if (conf["no-color"] || process.env.NO_COLOR) {
    logger_1.Logger.colors = false;
}
if (conf.verbose || process.env.DEBUG) {
    logger_1.Logger.isDebug = true;
}
if (conf.quiet) {
    logger_1.Logger.isDebug = false;
    logger_1.Logger.isInfo = false;
    logger_1.Logger.isWarn = false;
    logger_1.Logger.isError = false;
}
// Options override section
var options = {};
if (conf.emitDefinitionsOnly) {
    options.emitDefinitionsOnly = true;
}
if (conf.modelNamePreffix) {
    options.modelNamePreffix = conf.modelNamePreffix;
}
if (conf.modelNameSuffix) {
    options.modelNameSuffix = conf.modelNameSuffix;
}
if (conf.maxRecursiveDefinitionName || conf.maxRecursiveDefinitionName == 0) {
    options.maxRecursiveDefinitionName = conf.maxRecursiveDefinitionName;
}
if (conf.caseInsensitiveNames) {
    options.caseInsensitiveNames = conf.caseInsensitiveNames;
}
logger_1.Logger.debug("Options");
logger_1.Logger.debug(JSON.stringify(options, null, 2));
//
if (conf._ === undefined || conf._.length === 0) {
    logger_1.Logger.error("No WSDL files found");
    logger_1.Logger.debug("Path: ".concat(conf._));
    process.exit(1);
}
(function () {
    return __awaiter(this, void 0, void 0, function () {
        var outDir, errorsCount, matches, _i, matches_1, match, wsdlPath, wsdlName, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(conf.o === undefined || conf.o.length === 0)) return [3 /*break*/, 1];
                    logger_1.Logger.error("You forget to pass path to Output directory -o");
                    process.exit(1);
                    return [3 /*break*/, 8];
                case 1:
                    outDir = path_1.default.resolve(conf.o);
                    errorsCount = 0;
                    matches = conf._;
                    if (matches.length > 1) {
                        logger_1.Logger.debug(matches.map(function (m) { return path_1.default.resolve(m); }).join("\n"));
                        logger_1.Logger.log("Found ".concat(matches.length, " wsdl files"));
                    }
                    _i = 0, matches_1 = matches;
                    _a.label = 2;
                case 2:
                    if (!(_i < matches_1.length)) return [3 /*break*/, 7];
                    match = matches_1[_i];
                    wsdlPath = path_1.default.resolve(match);
                    wsdlName = path_1.default.basename(wsdlPath);
                    logger_1.Logger.log("Generating soap client from \"".concat(wsdlName, "\""));
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, (0, index_1.parseAndGenerate)(wsdlPath, path_1.default.join(outDir), options)];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    err_1 = _a.sent();
                    logger_1.Logger.error("Error occured while generating client \"".concat(wsdlName, "\""));
                    logger_1.Logger.error("\t".concat(err_1));
                    errorsCount += 1;
                    return [3 /*break*/, 6];
                case 6:
                    _i++;
                    return [3 /*break*/, 2];
                case 7:
                    if (errorsCount) {
                        logger_1.Logger.error("".concat(errorsCount, " Errors occured!"));
                        process.exit(1);
                    }
                    _a.label = 8;
                case 8: return [2 /*return*/];
            }
        });
    });
})();
//# sourceMappingURL=cli.js.map
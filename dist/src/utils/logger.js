"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
var chalk_1 = __importDefault(require("chalk"));
var supports_color_1 = __importDefault(require("supports-color"));
var Logger = /** @class */ (function () {
    function Logger() {
    }
    Logger.disabled = function () {
        Logger.isDebug = false;
        Logger.isLog = false;
        Logger.isInfo = false;
        Logger.isWarn = false;
        Logger.isError = false;
    };
    Logger.debug = function (str) {
        if (Logger.isDebug) {
            if (Logger.colors && supports_color_1.default.stdout) {
                console.log(chalk_1.default.grey(str));
            }
            else {
                console.log(str);
            }
        }
    };
    Logger.log = function (str) {
        if (Logger.isLog) {
            console.log(str);
        }
    };
    Logger.info = function (str) {
        if (Logger.isInfo) {
            if (Logger.colors && supports_color_1.default.stdout) {
                console.log(chalk_1.default.green(str));
            }
            else {
                console.log(str);
            }
        }
    };
    Logger.warn = function (str) {
        if (Logger.isWarn) {
            if (Logger.colors && supports_color_1.default.stdout) {
                console.log(chalk_1.default.yellow(str));
            }
            else {
                console.log(str);
            }
        }
    };
    Logger.error = function (str) {
        if (Logger.isError) {
            if (Logger.colors && supports_color_1.default.stderr) {
                console.error(chalk_1.default.red(str));
            }
            else {
                console.error(str);
            }
        }
    };
    Logger.isDebug = false;
    Logger.isLog = true;
    Logger.isInfo = true;
    Logger.isWarn = true;
    Logger.isError = true;
    Logger.colors = true;
    return Logger;
}());
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map
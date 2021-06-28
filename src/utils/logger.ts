import Chalk from "chalk";
import SupportsColors from "supports-color";

export class Logger {
    static isDebug = false;
    static isLog = true;
    static isInfo = true;
    static isWarn = true;
    static isError = true;
    static colors = true;

    static disabled() {
        Logger.isDebug = false;
        Logger.isLog = false;
        Logger.isInfo = false;
        Logger.isWarn = false;
        Logger.isError = false;
    }

    static debug(str: any) {
        if (Logger.isDebug) {
            if (Logger.colors && SupportsColors.stdout) {
                console.log(Chalk.grey(str));
            } else {
                console.log(str);
            }
        }
    }

    static log(str: any) {
        if (Logger.isLog) {
            console.log(str);
        }
    }

    static info(str: any) {
        if (Logger.isInfo) {
            if (Logger.colors && SupportsColors.stdout) {
                console.log(Chalk.green(str));
            } else {
                console.log(str);
            }
        }
    }

    static warn(str: any) {
        if (Logger.isWarn) {
            if (Logger.colors && SupportsColors.stdout) {
                console.log(Chalk.yellow(str));
            } else {
                console.log(str);
            }
        }
    }

    static error(str: any) {
        if (Logger.isError) {
            if (Logger.colors && SupportsColors.stderr) {
                console.error(Chalk.red(str));
            } else {
                console.error(str);
            }
        }
    }
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeCase = void 0;
var camelcase_1 = __importDefault(require("camelcase"));
function changeCase(input, options) {
    if (!(options === null || options === void 0 ? void 0 : options.pascalCase)) {
        return input.replace(/\./g, ""); // need to remove dots in the input string, otherwise, code generation fails
    }
    return (0, camelcase_1.default)(input, options);
}
exports.changeCase = changeCase;
//# sourceMappingURL=change-case.js.map
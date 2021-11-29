"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripExtension = void 0;
/**
 * @example "weather.wsdl" -> "weather"
 */
function stripExtension(filename) {
    return filename.split(".").slice(0, -1).join(".");
}
exports.stripExtension = stripExtension;
//# sourceMappingURL=file.js.map
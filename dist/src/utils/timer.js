"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeElapsed = void 0;
/**
 * Convert `process.hrtime` to `ms`
 */
function timeElapsed(time) {
    return (time[0] * 1000000000 + time[1]) / 1000000;
}
exports.timeElapsed = timeElapsed;
//# sourceMappingURL=timer.js.map
/**
 * Convert `process.hrtime` to `ms`
 */
export function timeElapsed(time: [number, number]) {
    return (time[0] * 1000000000 + time[1]) / 1000000;
}

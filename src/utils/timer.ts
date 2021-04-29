/**
 * Convert `process.hrtime` to `ms`
 */
export function timeElapsed(time: [number, number]) {
    return (time[0] * 1_000_000_000 + time[1]) / 1_000_000;
}

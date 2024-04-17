/**
 * @example isUrl("https://domain.com") -> true
 */
export function isUrl(uri: string): boolean {
    return /^https?:\/\//.test(uri);
}

export function stripQuery(url: string): string {
    return url.replace(/^(.*?)\?.*$/, "$1");
}

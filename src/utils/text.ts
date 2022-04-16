export function upperCaseFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.substring(1);
}

export function lowerCaseFirstLetter(str: string): string {
    return str.charAt(0).toLowerCase() + str.substring(1);
}

export function toCamel(str: string) {
    return str.replace(/(_\w)/g, function (m) {
        return m[1].toUpperCase();
    });
}

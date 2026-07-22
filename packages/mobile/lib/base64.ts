export const toBase64 = (buf: Uint8Array): string => 
    btoa(String.fromCharCode(...buf));

export const fromBase64 = (str: string): Uint8Array =>
    new Uint8Array(atob(str).split('').map(c => c.charCodeAt(0)));
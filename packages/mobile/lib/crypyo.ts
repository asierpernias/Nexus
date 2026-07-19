const toBase64 = (buf: Uint8Array) => btoa(String.fromCharCode(...buf));
const fromBase64 = (str: string) => new Uint8Array(atob(str).split('').map(c => c.charCodeAt(0)));

export async function cifrarClavePrivada(
    privateKey: Uint8Array,
    password: string
): Promise<{ cifrado: string; nonce: string; salt: string }> {
    const sodium = await import('react-native-libsodium');
    await sodium.ready;

    const salt = sodium.randombytes_buf(16);
    const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);

    // Derivar clave con crypto_auth (HMAC) usando salt como mensaje y password como clave
    const passwordBytes = new TextEncoder().encode(password);
    const paddedKey = new Uint8Array(sodium.crypto_auth_KEYBYTES);
    paddedKey.set(passwordBytes.slice(0, sodium.crypto_auth_KEYBYTES));

    const hmac = sodium.crypto_auth(salt, paddedKey);
    const clave = hmac.slice(0, sodium.crypto_secretbox_KEYBYTES);

    const cifrado = sodium.crypto_secretbox_easy(privateKey, nonce, clave);

    return {
        cifrado: toBase64(cifrado),
        nonce: toBase64(nonce),
        salt: toBase64(salt),
    };
}

export async function descifrarClavePrivada(
    datos: { cifrado: string; nonce: string; salt: string },
    password: string
): Promise<Uint8Array> {
    const sodium = await import('react-native-libsodium');
    await sodium.ready;

    const salt = fromBase64(datos.salt);
    const nonce = fromBase64(datos.nonce);
    const cifrado = fromBase64(datos.cifrado);

    const passwordBytes = new TextEncoder().encode(password);
    const paddedKey = new Uint8Array(sodium.crypto_auth_KEYBYTES);
    paddedKey.set(passwordBytes.slice(0, sodium.crypto_auth_KEYBYTES));

    const hmac = sodium.crypto_auth(salt, paddedKey);
    const clave = hmac.slice(0, sodium.crypto_secretbox_KEYBYTES);

    try {
        return sodium.crypto_secretbox_open_easy(cifrado, nonce, clave);
    } catch {
        throw new Error('Contraseña incorrecta');
    }
}
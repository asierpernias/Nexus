import {
    crypto_secretbox_easy,
    crypto_secretbox_open_easy,
    crypto_secretbox_NONCEBYTES,
    crypto_secretbox_KEYBYTES,
    crypto_pwhash,
    crypto_pwhash_ALG_ARGON2ID13,
    crypto_pwhash_OPSLIMIT_MODERATE,
    crypto_pwhash_MEMLIMIT_MODERATE,
    crypto_pwhash_SALTBYTES,
    randombytes_buf,
    from_base64,
    to_base64,
    from_string,
    ready,
} from 'react-native-libsodium';

async function derivarClave(password: string, salt: Uint8Array): Promise<Uint8Array> {
    await ready;
    return crypto_pwhash(
        crypto_secretbox_KEYBYTES,
        from_string(password),
        salt,
        crypto_pwhash_OPSLIMIT_MODERATE,
        crypto_pwhash_MEMLIMIT_MODERATE,
        crypto_pwhash_ALG_ARGON2ID13
    );
}

export async function cifrarClavePrivada(
    privateKey: Uint8Array,
    password: string
): Promise<{ cifrado: string; nonce: string; salt: string }> {
    await ready;
    const salt = randombytes_buf(crypto_pwhash_SALTBYTES);
    const nonce = randombytes_buf(crypto_secretbox_NONCEBYTES);
    const clave = await derivarClave(password, salt);
    const cifrado = crypto_secretbox_easy(privateKey, nonce, clave);

    return {
        cifrado: to_base64(cifrado),
        nonce: to_base64(nonce),
        salt: to_base64(salt),
    };
}

export async function descifrarClavePrivada(
    datos: { cifrado: string; nonce: string; salt: string },
    password: string
): Promise<Uint8Array> {
    await ready;
    const salt = from_base64(datos.salt);
    const nonce = from_base64(datos.nonce);
    const cifrado = from_base64(datos.cifrado);
    const clave = await derivarClave(password, salt);

    try {
        return crypto_secretbox_open_easy(cifrado, nonce, clave);
    } catch {
        throw new Error('Contraseña incorrecta');
    }
}
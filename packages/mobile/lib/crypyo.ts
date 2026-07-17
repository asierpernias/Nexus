import {
    crypto_secretbox_easy,
    crypto_secretbox_open_easy,
    crypto_secretbox_NONCEBYTES,
    crypto_secretbox_KEYBYTES,
    randombytes_buf,
    from_base64,
    to_base64,
    from_string,
    to_string,
} from 'react-native-libsodium';

const PBKDF2_ITERATIONS = 200_000;

async function derivarClave(password: string, salt: Uint8Array): Promise<Uint8Array> {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        enc.encode(password) as unknown as BufferSource,
        'PBKDF2',
        false,
        ['deriveBits']
    );

    const bits = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: salt as unknown as BufferSource,
            iterations: PBKDF2_ITERATIONS,
            hash: 'SHA-256',
        },
        keyMaterial,
        crypto_secretbox_KEYBYTES * 8
    );
    return new Uint8Array(bits)
}

export async function cifrarClavePrivada(
    privateKey: Uint8Array,
    password: string
): Promise<{cifrado: string; nonce: string; salt: string}> {
    const salt = randombytes_buf(16);
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
    datos: {cifrado: string; nonce: string; salt: string},
    password: string
): Promise<Uint8Array> {
    const salt = from_base64(datos.salt);
    const nonce = from_base64(datos.nonce);
    const cifrado = from_base64(datos.cifrado);
    const clave = await derivarClave(password, salt);

    try{
        return crypto_secretbox_open_easy(cifrado, nonce, clave);
    } catch {
        throw new Error('Contraseña incorrecta')
    }
}
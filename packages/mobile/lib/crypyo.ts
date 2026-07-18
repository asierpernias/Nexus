import {
    ready,
    from_string,
    from_base64,
    to_base64,
    randombytes_buf,
    crypto_secretbox_KEYBYTES,
    crypto_secretbox_NONCEBYTES,
    crypto_secretbox_easy,
    crypto_secretbox_open_easy,
    crypto_generichash,
    crypto_kdf_derive_from_key,
} from 'react-native-libsodium';
import * as SodiumModule from 'react-native-libsodium';

console.log("Sodium keys disponibles:", Object.keys(SodiumModule));
console.log("typeof crypto_generichash:", typeof crypto_generichash);
console.log("typeof crypto_kdf_derive_from_key:", typeof crypto_kdf_derive_from_key);

const SALT_BYTES = 16;

function derivarClave(password: string, salt: Uint8Array): Uint8Array {
    const passwordBytes = from_string(password);
    const material = new Uint8Array(passwordBytes.length + salt.length);
    material.set(passwordBytes, 0);
    material.set(salt, passwordBytes.length);
    return crypto_generichash(crypto_secretbox_KEYBYTES, material);
}

export async function cifrarClavePrivada(
    privateKey: Uint8Array,
    password: string
): Promise<{ cifrado: string; nonce: string; salt: string }> {
    try {
        await ready;
        console.log("ready ok");
        const salt = randombytes_buf(SALT_BYTES);
        console.log("salt ok");
        const nonce = randombytes_buf(crypto_secretbox_NONCEBYTES);
        console.log("nonce ok");
        const clave = derivarClave(password, salt);
        console.log("clave ok");
        const cifrado = crypto_secretbox_easy(privateKey, nonce, clave);
        console.log("cifrado ok");

        return {
            cifrado: to_base64(cifrado),
            nonce: to_base64(nonce),
            salt: to_base64(salt),
        };
    } catch (e) {
        console.log("ERROR EN CIFRADO:", e);
        console.log("ERROR stack:", e instanceof Error ? e.stack : 'sin stack');
        throw e;
    }
}

export async function descifrarClavePrivada(
    datos: { cifrado: string; nonce: string; salt: string },
    password: string
): Promise<Uint8Array> {
    await ready;
    const salt = from_base64(datos.salt);
    const nonce = from_base64(datos.nonce);
    const cifrado = from_base64(datos.cifrado);
    const clave = derivarClave(password, salt);

    try {
        return crypto_secretbox_open_easy(cifrado, nonce, clave);
    } catch {
        throw new Error('Contraseña incorrecta');
    }
}
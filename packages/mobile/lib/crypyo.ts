import sodium from 'react-native-libsodium';

const SALT_BYTES = 16;
function derivarClave(password: string, salt: Uint8Array): Uint8Array {
    const passwordBytes = sodium.from_string(password);
    const material = new Uint8Array(passwordBytes.length + salt.length);
    material.set(passwordBytes, 0);
    material.set(salt, passwordBytes.length);

    // Uint8Array vacío en vez de null/undefined — satisface el tipo y el runtime
    const sinKey = new Uint8Array(0);
    return sodium.crypto_generichash(sodium.crypto_secretbox_KEYBYTES, material, sinKey);
}

export async function cifrarClavePrivada(
    privateKey: Uint8Array,
    password: string
): Promise<{ cifrado: string; nonce: string; salt: string }> {
    try {
        await sodium.ready;
        console.log("ready ok");

        const salt = sodium.randombytes_buf(SALT_BYTES);
        console.log("salt ok");

        const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
        console.log("nonce ok");

        const clave = derivarClave(password, salt);
        console.log("clave ok");

        const cifrado = sodium.crypto_secretbox_easy(privateKey, nonce, clave);
        console.log("cifrado ok");

        return {
            cifrado: sodium.to_base64(cifrado),
            nonce: sodium.to_base64(nonce),
            salt: sodium.to_base64(salt),
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
    await sodium.ready;
    const salt = sodium.from_base64(datos.salt);
    const nonce = sodium.from_base64(datos.nonce);
    const cifrado = sodium.from_base64(datos.cifrado);
    const clave = derivarClave(password, salt);

    try {
        return sodium.crypto_secretbox_open_easy(cifrado, nonce, clave);
    } catch {
        throw new Error('Contraseña incorrecta');
    }
}
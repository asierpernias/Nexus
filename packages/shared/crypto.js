const sodium = require('libsodium-wrappers');

const CONTEXTO = 'ratchetE2';
const ID_CLAVE_MENSAJE = 1;
const ID_CLAVE_SIGUIENTE = 2;

async function avanzarCadena(claveActual) {
    await sodium.ready;

    const claveMensaje = sodium.crypto_kdf_derive_from_key(
        32,
        ID_CLAVE_MENSAJE,
        CONTEXTO,
        claveActual
    );
    
    const claveSiguiente = sodium.crypto_kdf_derive_from_key(
        32,
        ID_CLAVE_SIGUIENTE,
        CONTEXTO,
        claveActual
    );

    return { claveMensaje, claveSiguiente };

}

async function generarClaveCOmpartida(miClavePrivada, clavePublicaOtro) {
    await sodium.ready;

    const secretocompartido = sodium.crypto_scalarmult(miClavePrivada, clavePublicaOtro);

    const claveRaiz = sodium.crypto_generichash(32, secretocompartido);

    return claveRaiz;
}

async function cifrarMensaje(mensaje, claveMensaje) {
    await sodium.ready;

    const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
    const mensajeBytes = sodium.from_string(mensaje);

    const cifrado = sodium.cryptto_secretbox_easy(mensajeBytes, nonce, claveMensaje);

    return {
        cifrado: sodium.to_base64(cifrado),
        nonce: sodium.to_base64(nonce)
    };
}

async function descifrarMensaje(paqueteCifrado, claveMensaje) {
    await sodium.ready;

    const cifrado = sodium.from_base64(paqueteCifrado.cifrado);
    const nonce = sodium.from_base64(paqueteCifrado.nonce);

    const mensajeBytes = sodium.crypto_secretbox_open_easy(cifrado, nonce, claveMensaje);

    return sodium.to_string(mensajeBytes);
}

module.exports = { avanzarCadena, generarClaveCOmpartida, cifrarMensaje, descifrarMensaje }
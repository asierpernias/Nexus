const sodium = require('libsodium-wrappers');

const CONTEXTO = 'ratchetE';
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

async function generarClaveRaizCompartida(miClavePrivada, clavePublicaOtro) {
    await sodium.ready;

    const secretocompartido = sodium.crypto_scalarmult(miClavePrivada, clavePublicaOtro);

    const claveRaiz = sodium.crypto_generichash(32, secretocompartido);

    return claveRaiz;
}

async function cifrarMensaje(mensaje, claveMensaje) {
    await sodium.ready;

    const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
    const mensajeBytes = sodium.from_string(mensaje);

    const cifrado = sodium.crypto_secretbox_easy(mensajeBytes, nonce, claveMensaje);

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

async function generarParDH() {
    await sodium.ready;
    return sodium.crypto_kx_keypair();
}

async function avanzarRatchetDH(claveRaizActual, miClavePrivadaDH, clavePublicaDHRemota) {
    await sodium.ready;

    const secretDH = sodium.crypto_scalarmult(miClavePrivadaDH, clavePublicaDHRemota);

    const material = new Uint8Array(claveRaizActual.length + secretDH.length);
    material.set(claveRaizActual, 0);
    material.set(secretDH, claveRaizActual.length);
    const nuevaRaiz = sodium.crypto_generichash(32, material);

    const CONTEXTO_DH = 'dratchet';
    const nuevaCadena = sodium.crypto_kdf_derive_from_key(
        32, 1, CONTEXTO_DH, nuevaRaiz
    );

    return {nuevaRaiz, nuevaCadena };
}
module.exports = { generarParDH, avanzarRatchetDH, avanzarCadena, generarClaveRaizCompartida, cifrarMensaje, descifrarMensaje }
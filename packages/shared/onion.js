const sodium = require(`libsodium-wrappers`);

function ConstruirCapa(mensaje, clave, destino) {

    await sodium.ready;

    const clave = sodium.crypto_box_keypair();

    const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);

    const paquete = {
        siguiente: destino,
        payload: mensaje
    };

    const paqueteBytes = sodium.from_string(JSON.stringfy(paquete));

    const cifrado = sodium.crypto_box_easy(
        paqueteBytes,
        nonce,
        clavePublicaDestino,
        clave.privateKey
    );

    return  {
        cifrado: sodium.to_base64(cifrado),
        nonce: sodium.to_base64(nonce),
        clavePublicaEfimera: sodium.to_base64(clave.publicKey)
    };
}

module.exports = { ConstruirCapa };
const sodium = require(`libsodium-wrappers`);

async function ConstruirCapa(mensaje, clavePublicaDestino, destino) {

    await sodium.ready;

    const clave = sodium.crypto_box_keypair();

    const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);

    const paquete = {
        siguiente: destino,
        payload: mensaje
    };

    const paqueteBytes = sodium.from_string(JSON.stringify(paquete));

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

async function pelarCapa(capaCifrada, clavePrivadaPropia) {
    await sodium.ready;

    const cifrado = sodium.from_base64(capaCifrada.cifrado);
    const nonce = sodium.from_base64(capaCifrada.nonce);
    const clavePublicaEfimera = sodium.from_base64(capaCifrada.clavePublicaEfimera);

    const paqueteBytes = sodium.crypto_box_open_easy(
        cifrado,
        nonce,
        clavePublicaEfimera,
        clavePrivadaPropia
    );

    const paquete = JSON.parse(sodium.to_string(paqueteBytes));

    return paquete;
}


module.exports = { ConstruirCapa, pelarCapa };
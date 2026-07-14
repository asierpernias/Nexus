const fs = require('fs');
const path = require('path');
const sodium = require('libsodium-wrappers');

async function obtenerOcrearClaves(nombreNodo) {
    await sodium.ready;

    const rutasClave = path.join(__dirname, `claves-${nombreNodo}.json`);


    if (fs.existsSync(rutasClave)) {
        const contenido = fs.readFileSync(rutasClave, 'utf-8');
        const datos = JSON.parse(contenido);
        return {
            publicKey: sodium.from_base64(datos.publicKey),
            privateKey: sodium.from_base64(datos.privateKey)
        };
    }

    const par = sodium.crypto_box_keypair();
    const paraGuardar = {
        publicKey: sodium.to_base64(par.publicKey),
        privateKey: sodium.to_base64(par.privateKey)
    };

    fs.writeFileSync(rutasClave, JSON.stringify(paraGuardar, null, 2));

    return par;
}

module.exports = { obtenerOcrearClaves };
const fs = require('fs');
const path = require('path');
const sodium = require('libsodium-wrappers');

const RUTA_CLAVES = path.join(__dirname, 'claves-nodo.json');

async function obtenerOcrearClaves() {
    await sodium.ready;

    if (fs.existsSync(RUTA_CLAVES)) {
        const contenido = fs.readFileSync(RUTA_CLAVES, 'utf-8');
        const datos = JSON.parse(contenido);
        return {
            publcKey: sodium.from_base64(datos.publicKey),
            privateKey: sodium.from_base64(datos.privateKey)
        };
    }

    const par = sodium.crypto_box_keypair();
    const paraGuardar = {
        publicKey: sodium.to_base64(par.publcKey),
        privateKey: sodium.to_base64(par.privateKey)
    };

    fs.writeFileSync(RUTA_CLAVES, JSON.stringify(paraGuardar, null, 2));

    return par;
}

module.exports = { obtenerOcrearClaves };
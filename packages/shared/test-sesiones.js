const sodium = require('libsodium-wrappers');
const {
    iniciarSesion,
    enviarMensaje,
    recibirMensaje
} = require('./sesions');

async function prueba() {
    await sodium.ready;

    const claveA = sodium.crypto_box_keypair();
    const claveB = sodium.crypto_box_keypair();

    const carpetaA = __dirname + '/sesiones-A';
    const carpetaB = __dirname + '/sesiones-B';

    const fs = require('fs');
    if (!fs.existsSync(carpetaA)) fs.mkdirSync(carpetaA);
    if (!fs.existsSync(carpetaB)) fs.mkdirSync(carpetaB);

    await iniciarSesion(carpetaA, 'B', claveA.privateKey, claveB.publicKey);
    await iniciarSesion(carpetaB, 'A', claveB.privateKey, claveA.publicKey);

    const mensajes = ["hola", "¿Como estás?", "probando sesiones con ratchet"];

    for (const texto of mensajes) {
        const paquete = await enviarMensaje(carpetaA, 'B', texto);

        const textoDescifrado = await recibirMensaje(carpetaB, 'A', paquete);
        console.log(`Original: ${texto} -> Descifrado ${textoDescifrado}`)
    }   

}

prueba();
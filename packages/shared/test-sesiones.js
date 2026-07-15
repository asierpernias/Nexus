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

    const {clavePublicaDH: dhPublicaA} = await iniciarSesion(carpetaA, 'B', claveA.privateKey, claveB.publicKey);
    const {clavePublicaDH: dhPublicaB} =  await iniciarSesion(carpetaB, 'A', claveB.privateKey, claveA.publicKey);

    const estadoA = JSON.parse(fs.readFileSync(carpetaA + '/sesion-B.json'));
    const estadoB = JSON.parse(fs.readFileSync(carpetaB + '/sesion-A.json'));

    estadoA.clavePublicaDHRemota = sodium.to_base64(dhPublicaB);
    estadoB.clavePublicaDHRemota = sodium.to_base64(dhPublicaA);

    fs.writeFileSync(carpetaA + '/sesion-B.json', JSON.stringify(estadoA, null, 2));
    fs.writeFileSync(carpetaB + '/sesion-A.json', JSON.stringify(estadoB, null, 2));

    const mensajesdeAaB = ["hola", "¿Como estás?", "probando sesiones con ratchet"];
    const mensajesdeBa = ["hola", "BIEN?", "cambio y corto"];
    
    for (const texto of mensajesdeAaB) {
        const paquete = await enviarMensaje(carpetaA, 'B', texto);
        const textoDescifrado = await recibirMensaje(carpetaB, 'A', paquete);
        console.log(`A->B: ${texto} -> Descifrado ${textoDescifrado}`)
    }   
    for (const texto of mensajesdeBa) {
        const paquete = await enviarMensaje(carpetaB, 'A', texto);
        const textoDescifrado = await recibirMensaje(carpetaA, 'B', paquete);
        console.log(`B->A: ${texto} -> Descifrado ${textoDescifrado}`)
    }   

    const paquetefinal = await enviarMensaje(carpetaB, 'A', 'confirmacion final');
    const finaldescifrado = await recibirMensaje(carpetaA, 'B', paquetefinal);
    console.log(`Post-rotacion ${paquetefinal}, ${finaldescifrado}`);

}

prueba();
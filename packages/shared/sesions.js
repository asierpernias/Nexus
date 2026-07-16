const fs = require('fs');
const path = require('path');
const sodium = require('libsodium-wrappers');

const {
    avanzarCadena,
    generarClaveRaizCompartida,
    cifrarMensaje,
    descifrarMensaje,
    generarParDH,
    avanzarRatchetDH
} = require('./crypto');

function rutaSesion(carpetaUsuario, idCOntacto) {
    return path.join(carpetaUsuario, `sesion-${idCOntacto}.json`);
}

function guardarEstado(carpetaUsuario, idCOntacto, estado) {
    const ruta = rutaSesion(carpetaUsuario, idCOntacto);
    fs.writeFileSync(ruta, JSON.stringify(estado, null, 2));
}

function leerEstado(carpetaUsuario, idCOntacto) {
    const ruta = rutaSesion(carpetaUsuario, idCOntacto);
    if (!fs.existsSync(ruta)) {
        return null;
    }   
    return JSON.parse(fs.readFileSync(ruta, 'utf-8'));
}

async function iniciarSesion(carpetaUsuario, idCOntacto, miClavePrivada, clavePublicaContacto) {
    await sodium.ready;
    const claveRaiz = await generarClaveRaizCompartida(miClavePrivada, clavePublicaContacto);
    const parDH = await generarParDH();

    const CONTEXTO_CADENAS = 'cadenas0';
    const cadenaInicial = sodium.crypto_kdf_derive_from_key(32, 1, CONTEXTO_CADENAS, claveRaiz);
    
    const estado = {
        claveRaiz: sodium.to_base64(claveRaiz),
        cadenasEnvio: sodium.to_base64(cadenaInicial),
        cadenaRecepcion: sodium.to_base64(cadenaInicial),
        clavePrivadaDH: sodium.to_base64(parDH.privateKey),
        clavePublicaDH: sodium.to_base64(parDH.publicKey),
        clavePublicaDHRemota: null
    };

    guardarEstado(carpetaUsuario, idCOntacto, estado);
    return {clavePublicaDH: parDH.publicKey};
}

async function enviarMensaje( carpetaUsuario, idCOntacto, texto, miNombre) {
    await sodium.ready;
    const estado = leerEstado(carpetaUsuario, idCOntacto);
    if(!estado) {
        throw new Error('No hay sesion iniciada');
    }
    const cadenaActual = sodium.from_base64(estado.cadenasEnvio);
    const {claveMensaje, claveSiguiente} = await avanzarCadena(cadenaActual);
    estado.cadenasEnvio = sodium.to_base64(claveSiguiente);
    const paquete = await cifrarMensaje(texto, claveMensaje);
    guardarEstado(carpetaUsuario, idCOntacto, estado);
    return {
        ...paquete,
        clavePublicaDHEmisor: estado.clavePublicaDH,
        remitente: miNombre,
    };
}

async function recibirMensaje(carpetaUsuario, idCOntacto, paqueteCifrado) {
    await sodium.ready;
    const estado = leerEstado(carpetaUsuario, idCOntacto);
    if (!estado) {
        throw new Error(`No hay sesion iniciada. Llama a iniciarSesion`);
    }

    const claveRemotaNueva = paqueteCifrado.clavePublicaDHEmisor;
    const claveRemotaAnterior = estado.clavePublicaDHRemota;

    if (claveRemotaNueva !== claveRemotaAnterior) {

        const miClavePrivada = sodium.from_base64(estado.clavePrivadaDH);
        const clavePublicaRemota = sodium.from_base64(claveRemotaNueva);
        const claveRaizActual = sodium.from_base64(estado.claveRaiz);

        const {nuevaRaiz: raizTrasRecepcion, nuevaCadena: nuevaCadenaRecepcion} = await avanzarRatchetDH(
            claveRaizActual, miClavePrivada, clavePublicaRemota
        );
        const nuevoParDH = await generarParDH();

        const {nuevaRaiz: raizTrasEnvio, nuevaCadena: nuevaCadenaEnvio} = await avanzarRatchetDH(
            raizTrasRecepcion, nuevoParDH.privateKey, clavePublicaRemota
        );

        estado.claveRaiz = sodium.to_base64(raizTrasEnvio);
        estado.cadenasEnvio = sodium.to_base64(nuevaCadenaEnvio);
        estado.cadenaRecepcion = sodium.to_base64(nuevaCadenaRecepcion);
        estado.clavePrivadaDH = sodium.to_base64(nuevoParDH.privateKey);
        estado.clavePublicaDH = sodium.to_base64(nuevoParDH.publicKey);
        estado.clavePublicaDHRemota = claveRemotaNueva


    }
    const cadenaActual = sodium.from_base64(estado.cadenaRecepcion);
    const {claveMensaje, claveSiguiente} = await avanzarCadena(cadenaActual);
    const texto = await descifrarMensaje(paqueteCifrado, claveMensaje);
    estado.cadenaRecepcion = sodium.to_base64(claveSiguiente);
    guardarEstado(carpetaUsuario, idCOntacto, estado);
    return texto;
}

module.exports = { iniciarSesion, enviarMensaje, recibirMensaje };
const fs = require('fs');
const path = require('path');
const sodium = require('libsodium-wrappers');

const {
    avanzarCadena,
    generarClaveRaizCompartida,
    cifrarMensaje,
    descifrarMensaje
} = require('./crypto');

function rutaSesion(carpetaUsuario, idCOntacto) {
    return path.join(carpetaUsuario, `sesion-${idCOntacto}.json`);
}

function guardarEstadoCadena(carpetaUsuario, idCOntacto, claveCadena) {
    const ruta = rutaSesion(carpetaUsuario, idCOntacto);
    const datos = { cadena: sodium.to_base64(claveCadena)};
    fs.writeFileSync(ruta, JSON.stringify(datos, null, 2));
}

function leerEstadoCadenA(carpetaUsuario, idCOntacto) {
    const ruta = rutaSesion(carpetaUsuario, idCOntacto);
    if (!fs.existsSync(ruta)) {
        return null;
    }

    const contenido = fs.readFileSync(ruta, 'utf-8');
    const datos = JSON.parse(contenido);
    return sodium.from_base64(datos.cadena);
}

async function iniciarSesion(carpetaUsuario, idCOntacto, miClavePrivada, clavePublicaContacto) {
    await sodium.ready;
    const raiz = await generarClaveRaizCompartida(miClavePrivada, clavePublicaContacto);
    guardarEstadoCadena(carpetaUsuario, idCOntacto, raiz);
    return raiz;
}

async function enviarMensaje(carpetaUsuario, idCOntacto, texto) {
    await sodium.ready;
    const cadenaActual = leerEstadoCadenA(carpetaUsuario, idCOntacto);
    if(!cadenaActual) {
        throw new Error('No hay sesion iniciada. Llama a iniciarSesison ');
    }
    const {claveMensaje, claveSiguiente} = await avanzarCadena(cadenaActual);
    const paquete = await cifrarMensaje(texto, claveMensaje);
    guardarEstadoCadena(carpetaUsuario, idCOntacto, claveSiguiente);
    return paquete;
}

async function recibirMensaje(carpetaUsuario, idCOntacto, paqueteCifrado) {
    await sodium.ready;
    const cadenaActual = leerEstadoCadenA(carpetaUsuario, idCOntacto);
    if (!cadenaActual) {
        throw new Error(`No hay sesion iniciada. Llama a iniciarSesion`);
    }
    const {claveMensaje, claveSiguiente} = await avanzarCadena(cadenaActual);
    const texto = await descifrarMensaje(paqueteCifrado, claveMensaje);
    guardarEstadoCadena(carpetaUsuario, idCOntacto, claveSiguiente);
    return texto;
}

module.exports = { iniciarSesion, enviarMensaje, recibirMensaje };
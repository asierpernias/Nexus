const http = require('http');
const fs = require('fs');
const path = require('path');
const sodium = require('libsodium-wrappers');
const shared = require('shared');

const NOMBRE = process.argv[2];
const PUERTO = parseInt(process.argv[3]);
const COMANDO = process.argv[4];
const NOMBRE_DESTION = process.argv[5];
const TEXTO_MENSAJE = process.argv[6];

if (!NOMBRE || !PUERTO) {
    console.error('Uso incorrecto de client/index.js');
    process.exit(1);
}

const CARPETA_PROPIA = __dirname;
const RUTA_CLAVE_PROPIA = path.join(CARPETA_PROPIA, `claves-${NOMBRE}.json`);
const CARPETA_SESIONES = path.join(CARPETA_PROPIA, `claves-${NOMBRE}`);

if (!fs.existsSync(CARPETA_SESIONES)) fs.mkdirSync(CARPETA_SESIONES);

let miClavePrivada = null;
let miClavePublica = null;

async function obtenerCrearClavesPropias() {
    await sodium.ready;

    if (fs.existsSync(RUTA_CLAVE_PROPIA)) {
        const datos = JSON.parse(fs.readFileSync(RUTA_CLAVE_PROPIA, 'utf-8'));
        return {
            publicKey: sodium.from_base64(datos.publicKey),
            privateKey: sodium.from_base64(datos.privateKey)
        };
    }

    const par = sodium.crypto_box_keypair();
    fs.writeFileSync(RUTA_CLAVE_PROPIA, JSON.stringify({
        publicKey: sodium.to_base64(par.publicKey),
        privateKey: sodium.to_base64(par.privateKey)
    }, null, 2));
    return par;

}

function leerClavePublicaDe(nombreUsuario) {
    const ruta = path.join(CARPETA_PROPIA, `claves-${nombreUsuario}.json`);
    if (!fs.existsSync(ruta)) {
        throw new Error("no se encontro la clave publica")
    }
    const datos = JSON.parse(fs.readFileSync(ruta, 'utf-8'));
    return sodium.to_base64(datos.publicKey);
}

function leerClavePublicaNodo(nombreNodo) {
    const ruta = path.join(CARPETA_PROPIA, "..", 'relay-node', `claves-${nombreNodo}.json`);
    const datos = JSON.parse(fs.readFileSync(ruta, 'utf-8'));
    return sodium.from_base64(datos.publicKey);
}

async function asegurarSesionCon(nombreContacto) {
    const rutaSesion = path.join(CARPETA_SESIONES, `sesion-${nombreContacto}.json`);
    if (fs.existsSync(rutaSesion)) return;

    const clavePublicaContacto = leerClavePublicaDe(nombreContacto);
    await shared.iniciarSesion(CARPETA_SESIONES, nombreContacto, miClavePrivada, clavePublicaContacto);
    console.log("sesion ratchet inciada con", nombreContacto);
}

function enviarNodoA(capa) {
    const direccionA = shared.nodes['A'];
    const [host, port] = direccionA.split(":");
    const datos = JSON.stringify(capa);

    const opciones = {
        hostname: host,
        port: port,
        path: '/',
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'content-length': Buffer.byteLength(datos)
        }
    };

    const req = http.request(opciones, (res) => {
        let respuesta = '';
        res.on('data', chunk => respuesta += chunk);
        res.on('end', () => {
            console.log("respuesta del nodo A:", respuesta);
        });
    });

    req.on('error', (err) => {
        console.error("Error al enviar al nodo A:", err.message);
    });

    req.write(datos);
    req.end();
}

async function enviarMensaje(nombreDestion, texto) {
    await asegurarSesionCon(nombreDestion);

    const paqueteE2E = await shared.enviarMensaje( CARPETA_SESIONES, nombreDestion, texto, NOMBRE) ;

    const clavePublicaA = leerClavePublicaNodo('A');
    const clavePublicaB = leerClavePublicaNodo('B');
    const clavePublicaC = leerClavePublicaNodo('C');

    const capaParaC = await shared.ConstruirCapa(paqueteE2E, clavePublicaC, nombreDestion);
    const capaParaB = await shared.ConstruirCapa(capaParaC, clavePublicaB, 'C');
    const capaParaA = await shared.ConstruirCapa(capaParaB, clavePublicaA, 'B');

    console.log('Rnviando mensaje');
    enviarNodoA(capaParaA);
}

const servidor = http.createServer((req, res) => {
    if (req.method !== 'POST') {
        res.writeHead(405, {'content-type': 'application/json'});
        res.end(JSON.stringify({error: "Metodo no permitido usa POST"}));
        return;
    }

    let cuerpo = '';
    req.on('data', chunk => cuerpo += chunk.toString());
    req('end', async () => {
        let paqueteE2E;
        try {
            paqueteE2E = JSON.parse(cuerpo);
        } catch (err) {
            res.writeHead(400, {'content-type': 'application/json'});
            res.end(JSON.stringify({error: 'JSON invalido'}));
            return;
        }

        try {
            const nombreRemitente = paqueteE2E.remitente;
            if (!nombreRemitente) {
                throw new Error("No se indica el remitente");
            }

            await asegurarSesionCon(nombreRemitente);
            const texto = await shared.recibirMensaje(CARPETA_SESIONES, nombreRemitente, paqueteE2E);
            console.log(`[${NOMBRE}] Mensaje de ${nombreRemitente}: ${texto}`);

            res.writeHead(200, {'content-type': 'application/json'});
            res.end(JSON.stringify({status: 'descifrado'}));
        } catch (err) {
            console.error("Error al procesar el mensaje recibido", err.message);
            res.writeHead(400, {'content-type': 'application/json'});
            res.end(JSON.stringify({error: err.message}));
        }
    });
});

(async () => {
    await sodium.ready;
    const par = await obtenerCrearClavesPropias();
    miClavePrivada = par.privateKey;
    miClavePublica = par.publicKey;

    servidor.listen(PUERTO, async () => {
        console.log(`Cliente "${NOMBRE}" escuchando en el puerto ${PUERTO}`);
        console.log(`Clave publica: ${sodium.to_base64(miClavePublica)}`);

        if (COMANDO === 'enviar' && NOMBRE_DESTION && TEXTO_MENSAJE) {
            await enviarMensaje(NOMBRE_DESTION, TEXTO_MENSAJE);
        }
    });
})();
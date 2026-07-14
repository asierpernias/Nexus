const fs = require('fs');
const path = require('path');
const sodium = require('libsodium-wrappers');
const http = require('http');
const { constuirCapa, ConstruirCapa } = require('./onion');

function leerClavePublica(nombreNodo) {
    const ruta = path.join(__dirname, '..', 'relay-node', `claves-${nombreNodo}.json`);
    const contenido = fs.readFileSync(ruta, 'utf-8');
    const datos = JSON.parse(contenido);
    return sodium.from_base64(datos.publicKey);
}

function enviarANodoA(capa) {
    const datos = JSON.stringify(capa);
    const opciones = {
        hostname: `localhost`,
        port: 3301,
        path: '/',
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'content-length': Buffer.byteLength(datos)
        }
    };

    const req =http.request(opciones, (res) =>  {
        let respuesta = "";
        res.on('data', chunk => respuesta += chunk);
        res.on('end', () => {
            console.log("Respuesta nodo A:", respuesta);
        });
    });

    req.on('error', (err) => {
        console.error("Error al enviar al nodo A:", err.message);
    });

    req.write(datos);
    req.end();
}

async function prueba() {
    await sodium.ready;
    

    const clavePublicaA = leerClavePublica('A');
    const clavePublicaC = leerClavePublica('C');
    const clavePublicaB = leerClavePublica('B');
    
    const capaParaB = await ConstruirCapa("Hola mundo", clavePublicaB, 'Receptor' );
    const capaParaC = await ConstruirCapa(capaParaB, clavePublicaC, 'B' );
    const capaParaA = await ConstruirCapa(capaParaC, clavePublicaA, 'C' );

    console.log("Enviando paquete de 3 capas al nodo A..."),
    enviarANodoA(capaParaA);
};
prueba();
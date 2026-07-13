const  http = require(`http`);
const shared = require('shared');
const { obtenerOcrearClaves } = require('./claves');

const PUERTO = 3301;
const NOMBRE_NODO = 'A';

let clavePrivadaNodo = null;

function reenviarA(direccion, payload) {
    const [host, port] = direccion.split(':');

    const datos = JSON.stringify(payload);

    const opciones = {
        hostname: host,
        port: port,
        path: '/',
        method: 'POST',
        headers: {
            'content-type' : 'application/json',
            'content-length': Buffer.byteLength(datos)
        }
    };

    const req = http.request(opciones, (res) => {
        let respuesta = '';
        res.on('data', chunk => respuesta += chunk);
        res.on('end', () => {
            console.log('Respuesta de', direccion, respuesta);
        });
    });

    req.on('error', (err) => {
        console.error('Error al reenviar a', direccion, err.message);
    });

    req.write(datos);
    req.end();
}

const servidor = http.createServer((req, res) => {
    if (req.method === `POST`) {
        let cuerpo = ``;

        req.on(`data`, chunk => {
            cuerpo += chunk.toString();
        });

        req.on('end',async  () => {
            console.log("Recibido:", cuerpo);

            let datos;
            try {
                datos = JSON.parse(cuerpo);
            } catch (err) {
                res.writeHead(400, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({error: 'JSON Invalido'}));
                return;
            }

            try {
                const { siguiente, payload } = await shared.pelarCapa(datos, clavePrivadaNodo);
                
                if (siguiente === "Receptor") {
                    console.log("[NODO", NOMBRE_NODO, "]", "MENSAJE:", payload);
                } else {
                    const direccion = shared.nodes[siguiente];
                    if (!direccion) {
                        throw new Error("Sin direccion");
                    }
                    reenviarA(direccion, payload);
                }
                res.writeHead(200, {'content-type': 'application/json'});
                res.end(JSON.stringify({status: 'procesado'}));
            } catch (err) {
                console.error("Error:", err.message);
                res.writeHead(400, {'content-type': 'application/json'});
                res.end(JSON.stringify({error: "No se encontro el mensaje"}))
            }
        });
    } else {
        res.writeHead(405, {'content-type': 'application/json'});
        res.end(JSON.stringify({error: 'Metodo no permitido, usa POST'}));
    }
});

obtenerOcrearClaves().then((par) =>     {
    clavePrivadaNodo = par.privateKey;
    servidor.listen(PUERTO, () => {
        console.log('Nodo relay escuchando puerto', PUERTO);
    });
});
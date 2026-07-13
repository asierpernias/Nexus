const  http = require(`http`);

const PUERTO = 3301;

const servidor = http.createServer((req, res) => {
    if (req.method === `POST`) {
        let cuerpo = ``;

        req.on(`data`, chunk => {
            cuerpo += chunk.toString();
        });

        req.on('end', () => {
            console.log("Recibido:", cuerpo);

            let datos;
            try {
                datos = JSON.parse(cuerpo);
            } catch (err) {
                res.writeHead(400, {'COntent-Type': 'application/json'});
                res.end(JSON.stringify({error: 'JSON Invalido'}));
                return;
            }

            console.log('Datos parseados:', datos);

            res.writeHead(200, {'content-type': 'application/json'});
            res.end(JSON.stringify({status: 'recibido'}));
        });
    } else {
        res.writeHead(405, {'content-type': 'application/json'});
        res.end(JSON.stringify({error: 'Metodo no permitido, usa POST'}));
    }
});

servidor.listen(PUERTO, () => {
    console.log('Nodo relay escuchando puerto', PUERTO);
});
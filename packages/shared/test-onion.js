const { ConstruirCapa, pelarCapa } = require("./onion");

const sodium = require(`libsodium-wrappers`);

async function prueba() {

    await sodium.ready;

    const clave = sodium.crypto_box_keypair();

    const result1 = await ConstruirCapa("hola mundo", clave.publicKey, "Receptor");

    const resultado = await pelarCapa(result1, clave.privateKey);

    console.log(resultado)

};

prueba();
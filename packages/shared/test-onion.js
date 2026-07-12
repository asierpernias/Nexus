const { ConstruirCapa, pelarCapa } = require("./onion");

const sodium = require(`libsodium-wrappers`);


async function prueba() {

    await sodium.ready;

    
    const clave1 = sodium.crypto_box_keypair();
    const clave2 = sodium.crypto_box_keypair();
    const clave3 = sodium.crypto_box_keypair();


    const result1 = await ConstruirCapa("hola mundo", clave3.publicKey, "Receptor");
    const result2 = await ConstruirCapa(result1, clave2.publicKey, "B");
    const result3 = await ConstruirCapa(result2 , clave1.publicKey, "C");

    const resultado = await pelarCapa(result3, clave1.privateKey);
    const resultado2 = await pelarCapa(resultado.payload, clave2.privateKey);
    const resultado3 = await pelarCapa(resultado2.payload, clave3.privateKey);


    console.log(resultado, resultado2, resultado3)

};

prueba();
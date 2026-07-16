const sodium = require(`libsodium-wrappers`);

async function test() {
    await sodium.ready;

    const privEmisor = sodium.from_base64('u189Oa5745qkyvsbRY-VgObgbU7nH_DkcFDhbsF4tEg');
    const pubReceptor = sodium.from_base64('aL-FMbu7f1mLpWNQQTHGfCXIZypsWgwkjqbJwzVYD2M');

    const privReceptor = sodium.from_base64('kEFMfm5TmVHzB9JL3WH870yjfEb-A18N2Uawi43ivWs');
    const pubEMisor = sodium.from_base64('7FNFZkaC7uWyTKatXlBfpOgIDb1_WGGD3nzn8DkJBDc')

    const secreto = sodium.crypto_scalarmult(privEmisor, pubReceptor);
    const secreto2 = sodium.crypto_scalarmult(privReceptor, pubEMisor);

    console.log(sodium.to_base64(secreto));
    console.log(sodium.to_base64(secreto2));
    console.log(sodium.to_base64(secreto) === sodium.to_base64(secreto2));
}

async function tesst() {
    await sodium.ready;

    const claveraiz = sodium.from_base64('MVxUJ52WmE_w3xL3haKPvTB7L0dtIV6uqYwKqazS8XA')
    const cadena = sodium.crypto_kdf_derive_from_key(32,1,'cadenas0', claveraiz);
    console.log(sodium.to_base64(cadena))
}

test();
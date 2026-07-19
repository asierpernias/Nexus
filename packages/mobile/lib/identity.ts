import * as SecureStore from 'expo-secure-store';

const KEY_PRIVATE = 'identity_private_key';
const KEY_PUBLIC = 'identity_public_key';
const KEY_NAME = 'identity_name';

export interface Identity {
    nombre: string;
    publicKey: Uint8Array;
    privateKey: Uint8Array;
}

const toBase64 = (buf: Uint8Array) => btoa(String.fromCharCode(...buf));
const fromBase64 = (str: string) => new Uint8Array(atob(str).split('').map(c => c.charCodeAt(0)));

export async function crearIdentidad(nombre: string, privateKey: Uint8Array, publicKey: Uint8Array): Promise<void> {
    await SecureStore.setItemAsync(KEY_PRIVATE, toBase64(privateKey));
    await SecureStore.setItemAsync(KEY_PUBLIC, toBase64(publicKey));
    await SecureStore.setItemAsync(KEY_NAME, nombre);
}

export async function cargarIdentidad(): Promise<Identity | null> {
    const privB64 = await SecureStore.getItemAsync(KEY_PRIVATE);
    const pubB64 = await SecureStore.getItemAsync(KEY_PUBLIC);
    const nombre = await SecureStore.getItemAsync(KEY_NAME);

    if (!privB64 || !pubB64 || !nombre) return null;

    return {
        nombre,
        publicKey: fromBase64(pubB64),
        privateKey: fromBase64(privB64),
    };
}

export async function identidadExiste(): Promise<boolean> {
    const nombre = await SecureStore.getItemAsync(KEY_NAME);
    return nombre !== null;
}
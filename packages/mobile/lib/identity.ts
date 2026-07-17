import * as SecureStore from 'expo-secure-store';
import { randombytes_buf, from_base64, to_base64} from 'react-native-libsodium';

const KEY_PRIVATE = 'identity_private_key';
const KEY_PUBLIC = 'identity_public_key';
const KEY_NAME = 'identity_name';

export interface Identity {
    nombre: string;
    publicKey: Uint8Array;
    privateKey: Uint8Array;
}

export async function crearIdentidad(nombre: string, privateKey: Uint8Array, publicKey: Uint8Array): Promise<void>{
    await SecureStore.setItemAsync(KEY_PRIVATE, to_base64(privateKey));
    await SecureStore.setItemAsync(KEY_PUBLIC, to_base64(publicKey));
    await SecureStore.setItemAsync(KEY_NAME, nombre);    
}

export async function cargarIdentidad(): Promise<Identity | null> {
    const privB64 = await SecureStore.getItemAsync(KEY_PRIVATE);
    const pubB64 = await SecureStore.getItemAsync(KEY_PUBLIC);
    const nombre = await SecureStore.getItemAsync(KEY_NAME);

    if (!privB64 || !pubB64 || !nombre) return null;

    return {
        nombre,
        publicKey: from_base64(pubB64),
        privateKey: from_base64(privB64),
    };
}

export async function identidadExiste(): Promise<boolean> {
    const nombre = await SecureStore.getItemAsync(KEY_NAME);
    return nombre !== null;
}
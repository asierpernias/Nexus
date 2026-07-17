import React, {useState} from "react"; 
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';

import * as SecureStore from 'expo-secure-store';
import { crypto_box_keypair, to_base64, from_base64 } from "react-native-libsodium";
import { cifrarClavePrivada, descifrarClavePrivada } from "../lib/crypyo";
import { crearIdentidad, cargarIdentidad } from "../lib/identity";

const KEY_CIFRADO = 'identity_cifrado';

interface Props {
    onLogin: (nombre: string, publicKey: Uint8Array, privateKey: Uint8Array) => void;
}

export default function Login({onLogin} : Props) {
    const [nombre, setNombre] = useState('');
    const [password, setPassword] = useState('');
    const [cargando, setCargando] = useState(false);
    const [esNuevo, setEsNuevo] = useState<boolean | null>(null);

    React.useEffect(() => {
        SecureStore.getItemAsync('identity_name').then(n => setEsNuevo(n === null));
    }, []);

    async function handleSubmit() {
        if (!password || (!nombre && esNuevo)) {
            Alert.alert('Completa todos los campos');
            return;
        }
        setCargando(true);
        try {
            if (esNuevo) {
                const par = crypto_box_keypair();
                const datosCifrados = await cifrarClavePrivada(par.privateKey, password);
                await SecureStore.setItemAsync(KEY_CIFRADO, JSON.stringify(datosCifrados));
                await crearIdentidad(nombre, par.privateKey, par.publicKey);
                onLogin(nombre, par.publicKey, par.privateKey);
            } else {
                const identidad = await cargarIdentidad();
                const cifradoRaw = await SecureStore.getItemAsync(KEY_CIFRADO);
                if (!identidad || !cifradoRaw) throw new Error('Identidad no encontrada');
                const privateKey = await descifrarClavePrivada(JSON.parse(cifradoRaw), password);
                onLogin(identidad.nombre, identidad.publicKey, privateKey);
            }
        } catch (err: any) {
            Alert.alert("error", err.message);
        } finally {
            setCargando(false);
        }
    }

    if (esNuevo == null) return  <ActivityIndicator style={{ flex: 1 }} />;
    return (
        <View style={s.constainer}>
            <Text style={s.titulo}>Nexus</Text>
            <Text style={s.subtitulo} >{esNuevo ? 'Crear cuenta' : 'Bienvenido de nuevo'}</Text>
        
            {esNuevo && (
                <TextInput
                    style={s.input}
                    placeholder="Tu nombre"
                    placeholderTextColor="#888"
                    value={nombre}
                    onChangeText={setNombre}
                    autoCapitalize="none"
                />
            )}

            <TextInput
                style={s.input}
                placeholder="Contraseña"
                placeholderTextColor="#888"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TouchableOpacity style={s.boton} onPress={handleSubmit} disabled={cargando}>
                {cargando
                    ? <ActivityIndicator color="#fff"/>
                    : <Text style={s.botonTexto}>{esNuevo ? 'Crear' : 'Entrar'}</Text>
                }
            </TouchableOpacity>
        </View>
    );
}

const s = StyleSheet.create({
    constainer: {flex: 1, backgroundColor:"#0a0a0a", justifyContent: 'center', padding: 32},
    titulo: {color: '#fff', fontSize: 36, fontWeight: 'bold', marginBottom: 8},
    subtitulo: {color: '#888', fontSize: 16, marginBottom: 40},
    input: {
        backgroundColor: '#1a1a1a',
        color: "#fff",
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
        fontSize: 16,
    },
    boton: {
        backgroundColor: '#6c47ff',
        borderRadius: 10,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    botonTexto: {
        color: '#fff',
        fontSize: 16,
        fontWeight: "600",
    }
});
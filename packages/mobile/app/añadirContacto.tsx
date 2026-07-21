import React, {useState} from "react";
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, Alert
} from 'react-native';
import * as SecureStore from 'expo-secure-store';

interface Props {
    onVolver: () => void;
    onContactoAñadido: (nombre: string) => void;
}

export async function guardarContacto(nombre:string, publicKeyB64:string):Promise<void> {
    const clavesRaw = await SecureStore.getItemAsync('contactos');
    const contactos = clavesRaw ? JSON.parse(clavesRaw) : {};
    contactos[nombre] = publicKeyB64;
    await SecureStore.setItemAsync('contactos', JSON.stringify(contactos));
}

export async function cargarContactos(): Promise<Record<string, string>> {
    const raw = await SecureStore.getItemAsync('contactos');
    return raw ? JSON.parse(raw) : {};
}

export default function AnadirContacto({onVolver, onContactoAñadido}: Props) {
    const [nombre, setNombre] = useState('');
    const [clavePublica, setClavePublica] = useState('');
    const [cargando, setCargando] = useState(false);

    async function añadir(){
        if (!nombre.trim() || !clavePublica.trim()) {
            Alert.alert('Rellena todos los campos');
            return;
        } 

        setCargando(true);
        try {
            await guardarContacto(nombre.trim(), clavePublica.trim());
            onContactoAñadido(nombre.trim());
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setCargando(false);
        }
    }

    return (
         <View style={s.container}>
            <View style={s.header}>
                <TouchableOpacity onPress={onVolver}>
                    <Text style={s.volver}>  Volver</Text>
                </TouchableOpacity>
                <Text style={s.titulo}>← Añadir contactos</Text>
            </View>

            <View style={s.form}>
                <Text style={s.label}>Nombre</Text>
                <TextInput 
                    style={s.input}
                    placeholder="Nombre del contacto"
                    placeholderTextColor="#888"
                    value={nombre}
                    onChangeText={setNombre}
                    autoCapitalize="none"
                />
                <Text style={s.label}>Clave publica</Text>
                <TextInput 
                    style={[s.input, s.inputMulti]}
                    placeholder="Pega la clave publica en base 64"
                    placeholderTextColor="#888"
                    value={clavePublica}
                    onChangeText={setClavePublica}
                    multiline
                    autoCapitalize="none"
                />
                <TouchableOpacity
                    style={s.boton}
                    onPress={añadir}
                    disabled={cargando}
                >
                    <Text style={s.botonTexto}>
                        {cargando ? 'Guardando...' : 'Guardar contacto'}
                    </Text>
                </TouchableOpacity>
            </View>
         </View>
    );
}

const s = StyleSheet.create({
    container: {flex: 1, backgroundColor: '#0a0a0a'},
    header: {
        padding:20,
        paddingTop: 60,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a',
        gap:8,
    },
    volver: {color: '#6c47ff', fontSize: 16},
    titulo: { color: '#fff', fontSize: 24, fontWeight: 'bold'},
    form: { padding: 24, gap: 8},
    label: {color: '#888', fontSize: 14, marginBottom: 4, marginTop: 12},
    input: {
        backgroundColor: '#1a1a1a',
        color: '#fff',
        borderRadius: 10,
        padding: 16, fontSize: 16,
    },
    inputMulti: { height: 100, textAlignVertical: 'top'},
    boton: {
        backgroundColor: '#6c47ff',
        borderRadius: 10,
        padding: 16,
        alignItems: 'center',
        marginTop: 24,
    },
    botonTexto: { color: '#fff', fontSize: 16, fontWeight: '600'},
});

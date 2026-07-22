import React from "react";
import {View, Text, TouchableOpacity, StyleSheet, ScrollView} from 'react-native';
import QRCode from "react-native-qrcode-svg";
import sodium from 'react-native-libsodium';
import { toBase64 } from "../lib/base64";

interface Props {
    nombre: string;
    publicKey: Uint8Array;
    onVolver: () => void;
}

export default function Perfil({nombre, publicKey, onVolver}: Props) {
    const claveB64 = toBase64(publicKey);

    return (
        <ScrollView contentContainerStyle={s.container}>
            <View style={s.header}>
                <TouchableOpacity onPress={onVolver}>
                    <Text style={s.volver}>{'< Volver'} </Text>
                </TouchableOpacity>
                <Text style={s.titulo}>Mi perfil</Text>
                <View style={{width: 50}}/>
            </View>

            <View style={s.avatar}>
                <Text style={s.avatarLetra}>{nombre[0]?.toUpperCase()} </Text>
            </View>
            <Text style={s.avatarLetra}>{nombre} </Text>
            <View style={s.qrBox}>
                <QRCode value={claveB64} size={220} backgroundColor="#fff" />
            </View>

            <Text style={s.label}>Tu clave pùblica</Text>
            <View style={s.claveBox}>
                <Text style={s.claveTexto} selectable>{claveB64} </Text>
            </View>
            <Text style={s.aviso}>
                Comparte este codigo QR o la clave para que otros puedan añadirte
            </Text>
        </ScrollView>
    );
}

const s = StyleSheet.create({
    container: {flexGrow: 1, backgroundColor: '#0a0a0a', padding: 20, paddingTop: 60, alignItems: 'center'},
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 20},
    volver: {color: '#6c47ff', fontSize: 16},
    titulo: { color: '#fff', fontSize: 18, fontWeight: 'bold'},
    avatar: {
        width: 70, height: 70, borderRadius: 35, backgroundColor: '#6c47ff',
        justifyContent: 'center', alignItems: 'center', marginBottom: 10,
    },
    avatarLetra: { color: '#fff', fontSize: 28, fontWeight: 'bold'},
    nombre: {color: '#fff', fontSize: 29, fontWeight: '600', marginBottom: 24},
    qrBox: { backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 24},
    label: { color: '#888', fontSize: 13, alignSelf: 'flex-start', marginBottom: 6},
    claveBox: { backgroundColor: '#1a1a1a', borderRadius: 10, padding: 14,  width: '100%', marginBottom: 16},
    claveTexto: { color: '#fff', fontSize: 12, fontFamily: 'monospace'},
    aviso: { color: '#888', fontSize: 13, textAlign: 'center'},
});
import React, {useState} from "react";
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import { CameraView, useCameraPermissions} from 'expo-camera';

interface Props {
    onVolver: () => void;
    onClaveEscaneada: (claveB64: string)  => void;
}

export default function EscanearQR({onVolver, onClaveEscaneada}: Props) {
    const [permiso, pedirpermiso] = useCameraPermissions();
    const [escaneado, setEscaneado] = useState(false);

    if (!permiso) return <View style={s.container}/>
    
    if (!permiso.granted) {
        return (
            <View style={s.container}>
                <Text style={s.texto}>Necesitamos acceso a la camara para escanear el QR</Text>
                <TouchableOpacity style={s.boton} onPress={pedirpermiso}>
                    <Text style={s.botonTexto}>Dar permiso</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onVolver}> 
                    <Text style={s.volver}>Cancelar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={{flex: 1}}>
            <CameraView
                style={{flex: 1}}
                barcodeScannerSettings={{barcodeTypes: ['qr']}}
                onBarcodeScanned={escaneado ? undefined: ({data}) => {
                    setEscaneado(true);
                    onClaveEscaneada(data);
                }}
            />
            <TouchableOpacity style={s.cerrar} onPress={onVolver}>
                <Text style={s.botonTexto}>Cancelar</Text>
            </TouchableOpacity>
        </View>
    );
}

const s = StyleSheet.create({
    container: {flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center', padding: 20},
    texto: {color: '#fff', fontSize: 16, textAlign: 'center', marginBottom: 20,},
    boton: { backgroundColor: '#6c47ff', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10, marginBottom: 12},
    botonTexto: {color: '#fff', fontSize: 16, fontWeight: '600'},
    volver: { color: '#888', fontSize: 14},
    cerrar: {
        position: 'absolute', bottom:40, alignSelf: 'center',
        backgroundColor: '#1a1a1a', paddingHorizontal: 24, paddingVertical: 12,
        borderRadius: 10,
    },
})
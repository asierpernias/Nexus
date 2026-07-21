import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

interface Conversacion {
    nombre:string;
    ultimoMensaje:string;
    hora:string;
}

interface Props {
    nombre:string;
    onAbrirChat: (contacto: string) => void;
    onAnadirContacto: () => void
}
export default function Home({ nombre, onAbrirChat, onAnadirContacto }: Props) {
    const conversaciones: Conversacion[] = []; // por ahora vacío

    return (
        <View style={s.container}>
            <View style={s.header}>
                <Text style={s.titulo}>Nexus</Text>
                <TouchableOpacity style={s.botonAdd} onPress={onAnadirContacto}>
                    <Text style={s.botonAddTexto}>+</Text>
                </TouchableOpacity>
            </View>

            {conversaciones.length === 0 ? (
                <View style={s.vacio}>
                    <Text style={s.vacioTexto}>No hay conversaciones</Text>
                    <Text style={s.vacioSub}>Pulsa + para añadir un contacto</Text>
                </View>
            ) : (
                <FlatList
                    data={conversaciones}
                    keyExtractor={item => item.nombre}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={s.item} onPress={() => onAbrirChat(item.nombre)}>
                            <View style={s.avatar}>
                                <Text style={s.avatarLetra}>{item.nombre[0].toUpperCase()}</Text>
                            </View>
                            <View style={s.itemInfo}>
                                <Text style={s.itemNombre}>{item.nombre}</Text>
                                <Text style={s.itemMensaje}>{item.ultimoMensaje}</Text>
                            </View>
                            <Text style={s.itemHora}>{item.hora}</Text>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
}

const s = StyleSheet.create({
    container: {flex:1, backgroundColor: '#0a0a0a'},
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 60,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a',
    },
    titulo: {color: '#fff', fontSize: 24, fontWeight: 'bold'},
    botonAdd: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: '#6c47ff',
        justifyContent: 'center', alignItems: 'center',
    },
    botonAddTexto: { color: '#fff', fontSize: 24, lineHeight: 28,},
    vacio: { flex: 1, justifyContent: 'center', alignItems: 'center'},
    vacioTexto: { color: '#fff', fontSize: 18, marginBottom: 8,},
    vacioSub: {color: '#888', fontSize: 14},
    item: {
        flexDirection: 'row', alignItems: 'center',
        padding: 16, borderBottomWidth: 1, borderBottomColor: '#1a1a1a',
    },
    avatar: {
        width: 46, height: 46, borderRadius: 23,
        backgroundColor: '#6c47ff',
        justifyContent: 'center', alignItems: 'center',
        marginRight: 12,
    },
    avatarLetra: {color: '#fff', fontSize: 18, fontWeight: 'bold'},
    itemInfo: {flex: 1},
    itemNombre: { color: '#fff', fontSize: 16, fontWeight: '600'},
    itemMensaje: {color: '#888', fontSize: 14, marginTop: 2},
    itemHora: {color: '#888', fontSize: 12}
});
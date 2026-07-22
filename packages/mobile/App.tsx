import React, { useState } from "react";
import Login from './app/login';
import Home from "./app/Home";
import AnadirContacto from "./app/añadirContacto";
import Perfil from "./app/Perfil";
import EscanearQR from "./app/EscanearQr"
interface Identidad {
  nombre: string;
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

type Pantalla = 'home' | 'chat' | 'añadir';

export default function App() {
  const [identidad, setIdentidad] = useState<Identidad | null>(null);
  const [pantalla, setPantalla] = useState<Pantalla>('home');
  const [chatActivo, setChatActivo] = useState<string | null>(null);

  if (!identidad) {
    return (
      <Login onLogin={(nombre, publicKey, privateKey) =>
          setIdentidad({ nombre, publicKey, privateKey })
      } />
    );
  }

  if (pantalla === 'añadir') {
    return (
      <AnadirContacto 
        onVolver={() => setPantalla('home')}
        onContactoAñadido={() => setPantalla('home')}
        />
    );
  }

  return (
    <Home
      nombre={identidad.nombre}
      onAbrirChat={(contacto) => {
        setChatActivo(contacto);
        setPantalla('chat');
      }}
      onAnadirContacto={() => setPantalla('añadir')}
    />
  );
}
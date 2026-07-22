import React, { useState } from "react";
import Login from './app/login';
import Home from "./app/Home";
import AnadirContacto from "./app/añadirContacto";
import Perfil from "./app/Perfil";
import QRCode from "./app/EscanearQR";
import EscanearQR from "./app/EscanearQR";

interface Identidad {
  nombre: string;
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

type Pantalla = 'home' | 'chat' | 'añadir' | 'perfil' | 'escanear';

export default function App() {
  const [identidad, setIdentidad] = useState<Identidad | null>(null);
  const [pantalla, setPantalla] = useState<Pantalla>('home');
  const [chatActivo, setChatActivo] = useState<string | null>(null);
  const [claveEscaneada, setClaveEscaneada] = useState<string |null>(null);

  if (!identidad) {
    return (
      <Login onLogin={(nombre, publicKey, privateKey) =>
          setIdentidad({ nombre, publicKey, privateKey })
      } />
    );
  }

  if (pantalla === 'perfil') {
    return (
      <Perfil 
        nombre={identidad.nombre}
        publicKey={identidad.publicKey}
        onVolver={() => setPantalla('home')}
      />
    );
  }

  if (pantalla === 'escanear') {
    return (
      <EscanearQR
        onVolver={() => setPantalla('añadir')}
        onClaveEscaneada={(claveB64) => {
          setClaveEscaneada(claveB64);
          setPantalla('añadir');
        }}
      />
    );
  }

  if (pantalla === 'añadir') {
    return (
      <AnadirContacto 
        onVolver={() => setPantalla('home')}
        onContactoAñadido={() => setPantalla('home')}
        onEscanearQr={() => setPantalla('escanear')}
        claveEscaneada={claveEscaneada}
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
      onAbrirPerfil={() => setPantalla('perfil')}
    />
  );
}
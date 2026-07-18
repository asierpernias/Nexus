import React, { useState } from "react";
import Login from './app/login';
import { View } from 'react-native';

interface Identidad {
  nombre: string;
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

export default function App() {
  const [identidad, setIdentidad] = useState<Identidad | null>(null);
  if (!identidad) {
    return (
      <Login onLogin={(nombre, publicKey, privateKey) =>
          setIdentidad({nombre, publicKey, privateKey})
      } />
    );
  }

  return <View style={{flex:1, backgroundColor:"#0a0a0a"}} />;
}
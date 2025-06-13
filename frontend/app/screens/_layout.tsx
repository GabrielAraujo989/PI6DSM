import { Drawer } from "expo-router/drawer";
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import React from 'react';

function DrawerLayoutInner() {
  const { user } = useAuth();
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        swipeEnabled: true,
        drawerType: 'back', // Altera para abrir do lado direito
        drawerPosition: 'right', // Garante que o Drawer abre à direita
      }}
    >
      
      <Drawer.Screen name="monitoramento" options={{ title: "Monitoramento" }} />
      <Drawer.Screen name="dashboard" options={{ title: "Início" }} />
      {(user?.role === 'ADMIN' || user?.role === 'SUPER_USER') && (
        <Drawer.Screen name="users" options={{ title: "Usuários" }} />
      )}
      <Drawer.Screen name="logout" options={{
        title: "Sair",
        drawerLabelStyle: { color: 'red', fontWeight: 'bold' }
      }} />
    </Drawer>
  );
}

export default function DrawerLayout() {
  return (
    <AuthProvider>
      <DrawerLayoutInner />
    </AuthProvider>
  );
}

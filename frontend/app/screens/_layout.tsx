import { Drawer } from "expo-router/drawer";

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        swipeEnabled: true,
        drawerType: 'front',
      }}
    >
      <Drawer.Screen name="dashboard" options={{ title: "Início" }} />
      <Drawer.Screen name="monitoramento" options={{ title: "Monitoramento" }} />
      <Drawer.Screen name="cadastro" options={{ title: "Cadastros" }} />
      <Drawer.Screen name="imagens" options={{ title: "Imagens/Upload" }} />
      <Drawer.Screen name="logout" options={{ title: "Sair" }} />
      <Drawer.Screen name="login" options={{ title: "Login" }} />
    </Drawer>
  );
}
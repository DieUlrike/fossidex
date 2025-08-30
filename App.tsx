import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import ExpeditionScreen from "./src/screens/ExpeditionScreen";
import FundeScreen from "./src/screens/FundeScreen";
import SammlungScreen from "./src/screens/SammlungScreen";
import { FundProvider } from "./src/context/FundContext";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <FundProvider>
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen name="Expedition planen" component={ExpeditionScreen} />
          <Tab.Screen name="Funde dokumentieren" component={FundeScreen} />
          <Tab.Screen name="Sammlung" component={SammlungScreen} />
        </Tab.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </FundProvider>
  );
}

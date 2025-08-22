import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import ExpeditionScreen from './src/screens/ExpeditionScreen';
import FundeScreen from './src/screens/FundeScreen';
import ArchivScreen from './src/screens/ArchivScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Expedition planen" component={ExpeditionScreen} />
        <Tab.Screen name="Funde dokumentieren" component={FundeScreen} />
        <Tab.Screen name="Archiv durchstöbern" component={ArchivScreen} />
      </Tab.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

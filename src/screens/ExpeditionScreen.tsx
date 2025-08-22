import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RegionList from "./expedition/RegionList";
import RegionDetail from "./expedition/RegionDetail";

type ExpeditionStackParamList = {
  RegionList: undefined;
  RegionDetail: { regionId: string; regionName: string };
};

const Stack = createNativeStackNavigator<ExpeditionStackParamList>();

export default function ExpeditionScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen
      name="RegionList"
      component={RegionList}
      options={{ headerShown: false }}
    />
      <Stack.Screen
        name="RegionDetail"
        component={RegionDetail}
        options={({ route }) => ({ title: route.params.regionName })}
      />
    </Stack.Navigator>
  );
}

import { View, Text, Pressable } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FundForm from "./funde/FundForm";

type FundeStackParamList = {
  FundeStart: undefined;
  FundForm: undefined; // später mit Parametern (z. B. vorgewählte Region/Location)
};

const Stack = createNativeStackNavigator<FundeStackParamList>();

function FundeStartScreen({ navigation }: { navigation: any }) {
  return (
    <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
      <Text style={{ fontSize: 20, textAlign: "center", marginBottom: 16 }}>
        Funde
      </Text>
      <Pressable
        onPress={() => navigation.navigate("FundForm")}
        style={{
          padding: 16,
          borderRadius: 8,
          backgroundColor: "#efefef",
          alignItems: "center",
          marginHorizontal: 16,
        }}
        accessibilityLabel="Fund hinzufügen"
      >
        <Text style={{ fontSize: 16 }}>Fund hinzufügen</Text>
      </Pressable>

      {/* Optional: später hier eine kleine Liste „Zuletzt hinzugefügt“ */}
    </View>
  );
}

export default function FundeScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="FundeStart"
        component={FundeStartScreen}
        options={{ title: "Funde" }}
      />
      <Stack.Screen
        name="FundForm"
        component={FundForm}
        options={{ title: "Fund hinzufügen" }}
      />
    </Stack.Navigator>
  );
}
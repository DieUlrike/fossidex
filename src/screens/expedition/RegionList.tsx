import { View, Text, FlatList, Pressable } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import regions from "../../data/regions.json"; // <-- Import unserer JSON-Datei

type ExpeditionStackParamList = {
  RegionList: undefined;
  RegionDetail: { regionId: string; regionName: string };
};

type Props = NativeStackScreenProps<ExpeditionStackParamList, "RegionList">;

export default function RegionList({ navigation }: Props) {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 12 }}>Region wählen</Text>
      <FlatList
        data={regions} // <-- Daten kommen jetzt aus JSON
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              navigation.navigate("RegionDetail", {
                regionId: item.id,
                regionName: item.name,
              })
            }
            style={{
              padding: 16,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#ddd",
              marginBottom: 10,
              backgroundColor: "#fff",
            }}
          >
            <Text style={{ fontSize: 16 }}>{item.name}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

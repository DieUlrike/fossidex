import { View, Text } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type ExpeditionStackParamList = {
  RegionList: undefined;
  RegionDetail: { regionId: string; regionName: string };
};

type Props = NativeStackScreenProps<ExpeditionStackParamList, "RegionDetail">;

export default function RegionDetail({ route }: Props) {
  const { regionId, regionName } = route.params;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, marginBottom: 12 }}>{regionName}</Text>

      <Text style={{ fontWeight: "600", marginBottom: 6 }}>
        Typische Fossilien hier
      </Text>
      <Text style={{ color: "#666", marginBottom: 16 }}>
        (Platzhalter-Liste, später mit „Gefunden!“ Buttons)
      </Text>

      <Text style={{ fontWeight: "600", marginBottom: 6 }}>
        Meine Locations in dieser Region
      </Text>
      <Text style={{ color: "#666" }}>
        (Platzhalter-Liste, später mit Button „Neue Location anlegen“)
      </Text>

      <Text style={{ marginTop: 24, color: "#999" }}>
        regionId: {regionId}
      </Text>
    </View>
  );
}

import { View, Text, FlatList, Pressable, Alert } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
// RegionDetail liegt in src/screens/expedition/, data liegt parallel zu screens/
import regions from "../../data/regions.json";

type ExpeditionStackParamList = {
  RegionList: undefined;
  RegionDetail: { regionId: string; regionName: string };
};

type Props = NativeStackScreenProps<ExpeditionStackParamList, "RegionDetail">;

type Region = {
  id: string;
  name: string;
  fossils: string[]; // einfache Namen in der Seed-Phase
  locations?: { id: string; name: string }[];
};

export default function RegionDetail({ route }: Props) {
  const { regionId, regionName } = route.params;

  // Region aus JSON holen
  const region: Region | undefined = (regions as Region[]).find((r) => r.id === regionId);
  const fossils = region?.fossils ?? [];
  const locations = region?.locations ?? [];

  if (!region) {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 18, color: "#b00" }}>
          Region nicht gefunden (id: {regionId})
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 16 }}>
      {/* Titel steht im Header; hier nur Inhalte */}

      {/* Abschnitt: Typische Fossilien */}
      <View>
        <Text style={{ fontWeight: "600", marginBottom: 8 }}>
          Typische Fossilien hier
        </Text>

        {fossils.length === 0 ? (
          <Text style={{ color: "#666" }}>Keine Fossilien eingetragen.</Text>
        ) : (
          <FlatList
            data={fossils}
            keyExtractor={(name) => name}
            renderItem={({ item: name }) => (
              <View
                style={{
                  padding: 12,
                  borderWidth: 1,
                  borderColor: "#ddd",
                  borderRadius: 8,
                  marginBottom: 8,
                  backgroundColor: "#fff",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text>{name}</Text>
                <Pressable
                  onPress={() =>
                    Alert.alert("Gefunden!", `${name} erfassen – Dialog kommt als Nächstes`)
                  }
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: "#efefef",
                  }}
                  accessibilityLabel={`${name} gefunden erfassen`}
                >
                  <Text>Gefunden!</Text>
                </Pressable>
              </View>
            )}
          />
        )}
      </View>

      {/* Abschnitt: Meine Locations aus JSON (Seed) */}
      <View>
        <Text style={{ fontWeight: "600", marginBottom: 8 }}>
          Meine Locations in dieser Region
        </Text>

        {locations.length === 0 ? (
          <Text style={{ color: "#666" }}>Noch keine Locations eingetragen.</Text>
        ) : (
          <FlatList
            data={locations}
            keyExtractor={(l) => l.id}
            renderItem={({ item }) => (
              <View
                style={{
                  padding: 12,
                  borderWidth: 1,
                  borderColor: "#ddd",
                  borderRadius: 8,
                  marginBottom: 8,
                  backgroundColor: "#fff",
                }}
              >
                <Text style={{ fontSize: 16 }}>{item.name}</Text>
              </View>
            )}
          />
        )}

        <Pressable
          onPress={() => Alert.alert("Neue Location", "Formular kommt gleich")}
          style={{
            marginTop: 8,
            padding: 12,
            borderRadius: 8,
            backgroundColor: "#efefef",
            alignItems: "center",
          }}
          accessibilityLabel="Neue Location anlegen"
        >
          <Text>Neue Location anlegen</Text>
        </Pressable>
      </View>
    </View>
  );
}

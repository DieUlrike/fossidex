import { View, Text, FlatList, Pressable, Alert } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
// Pfad: RegionDetail liegt in src/screens/expedition/, data liegt parallel zu screens/
import regions from "../../data/regions.json";

type ExpeditionStackParamList = {
  RegionList: undefined;
  RegionDetail: { regionId: string; regionName: string };
};

type Props = NativeStackScreenProps<ExpeditionStackParamList, "RegionDetail">;

type Region = {
  id: string;
  name: string;
  fossils: string[]; // einfache Liste von Namen (Dummy-Phase)
};

// (optional) Platzhalter: eigene Locations in dieser Region – später aus DB
const MY_LOCATIONS_BY_REGION: Record<string, { id: string; name: string; visitedAt?: string }[]> = {
  // Beispiel, falls du schon was sehen willst:
  ostsee: [{ id: "timmendorf", name: "Timmendorfer Strand", visitedAt: "2025-08-10" }],
  alb: [{ id: "holzmaden", name: "Steinbruch Holzmaden", visitedAt: "2025-07-28" }],
};

export default function RegionDetail({ route }: Props) {
  const { regionId, regionName } = route.params;

  // Region aus JSON holen
  const region: Region | undefined = (regions as Region[]).find((r) => r.id === regionId);
  const fossils = region?.fossils ?? [];
  const myLocations = MY_LOCATIONS_BY_REGION[regionId] ?? [];

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
      {/* Titel kommt aus dem Header; hier lassen wir nur Inhalte */}

      {/* Abschnitt: Typische Fossilien */}
      <View>
        <Text style={{ fontWeight: "600", marginBottom: 8 }}>Typische Fossilien hier</Text>
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
                  onPress={() => {
                    Alert.alert("Gefunden!", `${name} erfassen – Dialog kommt als Nächstes`);
                  }}
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

      {/* Abschnitt: Meine Locations */}
      <View>
        <Text style={{ fontWeight: "600", marginBottom: 8 }}>Meine Locations in dieser Region</Text>
        {myLocations.length === 0 ? (
          <Text style={{ color: "#666" }}>Noch keine Locations angelegt.</Text>
        ) : (
          <FlatList
            data={myLocations}
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
                {item.visitedAt ? (
                  <Text style={{ color: "#666" }}>Besucht am {item.visitedAt}</Text>
                ) : null}
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

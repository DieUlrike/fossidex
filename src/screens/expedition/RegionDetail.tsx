import { View, Text, FlatList, Pressable, Alert } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type ExpeditionStackParamList = {
  RegionList: undefined;
  RegionDetail: { regionId: string; regionName: string };
};

type Props = NativeStackScreenProps<ExpeditionStackParamList, "RegionDetail">;

// Platzhalter-Daten: typische Fossilien pro Region
const FOSSILS_BY_REGION: Record<string, { id: string; name: string }[]> = {
  ostsee: [
    { id: "ammonite", name: "Ammonit" },
    { id: "belemnite", name: "Donnerkeil" },
    { id: "echinoid", name: "Seeigel" },
    { id: "wood", name: "Fossiles Holz" },
    { id: "amber", name: "Bernstein" }
  ],
  ruegen: [
    { id: "belemnite", name: "Donnerkeil" },
    { id: "ammonite", name: "Ammonit" },
    { id: "echinoid", name: "Seeigel" }
  ],
  alb: [
    { id: "ammonite", name: "Ammonit" }
  ]
};

// Platzhalter: deine Locations in dieser Region
const MY_LOCATIONS_BY_REGION: Record<string, { id: string; name: string; visitedAt?: string }[]> = {
  ostsee: [
    { id: "timmendorf", name: "Timmendorfer Strand", visitedAt: "2025-08-10" }
  ],
  ruegen: [],
  alb: [
    { id: "holzmaden", name: "Steinbruch Holzmaden", visitedAt: "2025-07-28" }
  ]
};

export default function RegionDetail({ route }: Props) {
  const { regionId, regionName } = route.params;
  const fossils = FOSSILS_BY_REGION[regionId] ?? [];
  const myLocations = MY_LOCATIONS_BY_REGION[regionId] ?? [];

  return (
    <View style={{ flex: 1, padding: 16, gap: 16 }}>
      <Text style={{ fontSize: 20 }}>{regionName}</Text>

      <View>
        <Text style={{ fontWeight: "600", marginBottom: 8 }}>Typische Fossilien hier</Text>
        <FlatList
          data={fossils}
          keyExtractor={(f) => f.id}
          renderItem={({ item }) => (
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
                alignItems: "center"
              }}
            >
              <Text>{item.name}</Text>
              <Pressable
                onPress={() => {
                  Alert.alert("Gefunden!", `${item.name} erfassen (kommt gleich)`);
                }}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 8,
                  backgroundColor: "#efefef"
                }}
                accessibilityLabel={`${item.name} gefunden erfassen`}
              >
                <Text>Gefunden!</Text>
              </Pressable>
            </View>
          )}
        />
      </View>

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
                  backgroundColor: "#fff"
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
            alignItems: "center"
          }}
          accessibilityLabel="Neue Location anlegen"
        >
          <Text>Neue Location anlegen</Text>
        </Pressable>
      </View>
    </View>
  );
}

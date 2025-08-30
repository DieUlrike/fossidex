// src/screens/SammlungScreen.tsx
import React, { useMemo } from "react";
import { View, Text, SafeAreaView, ScrollView, Pressable } from "react-native";
import regionsData from "../data/regions.json";
import { useFundContext } from "../context/FundContext";

// Wir unterstützen beide Datenmodelle:
// - fossils: string[]
// - fossils: { id, name, image?, imageGray? }[]
type FossilEntry =
  | string
  | { id: string; name: string; image?: string; imageGray?: string };

type Region = {
  id: string;
  name: string;
  fossils: FossilEntry[];
  locations?: { id: string; name: string }[];
};

export default function SammlungScreen() {
  const regions = regionsData as Region[];
  const { funds } = useFundContext(); // erwartet: [{ fossil: string, ... }]

  // Alle Fossil-Namen einmalig (über alle Regionen/Locations hinweg)
  const allFossils = useMemo(() => {
    const names = new Set<string>();
    regions.forEach((r) => {
      (r.fossils ?? []).forEach((f) => {
        const name = typeof f === "string" ? f : f.name;
        if (name) names.add(name);
      });
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b, "de"));
  }, [regions]);

  // Gesammelt = Fossile mit mind. einem Fund
  const collectedSet = useMemo(() => {
    const s = new Set<string>();
    (funds ?? []).forEach((f) => {
      if (f?.fossil) s.add(String(f.fossil));
    });
    return s;
  }, [funds]);

  const gesammelt = useMemo(
    () => allFossils.filter((n) => collectedSet.has(n)),
    [allFossils, collectedSet]
  );
  const zuSammeln = useMemo(
    () => allFossils.filter((n) => !collectedSet.has(n)),
    [allFossils, collectedSet]
  );

  const Chip: React.FC<{ label: string; variant: "done" | "todo" }> = ({
    label,
    variant,
  }) => (
    <View
      style={{
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: variant === "done" ? "#9ad29a" : "#ddd",
        backgroundColor: variant === "done" ? "#e9f7e9" : "#f7f7f8",
        marginRight: 8,
        marginBottom: 8,
      }}
    >
      <Text
        style={{
          fontWeight: "600",
          color: variant === "done" ? "#227a22" : "#333",
        }}
      >
        {label}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>
          Sammlung
        </Text>

        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 8 }}>
            Gesammelt ({gesammelt.length})
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {gesammelt.length === 0 ? (
              <Text style={{ color: "#777" }}>Noch nichts gesammelt.</Text>
            ) : (
              gesammelt.map((name) => <Chip key={name} label={name} variant="done" />)
            )}
          </View>
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 8 }}>
            Zu sammeln ({zuSammeln.length})
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {zuSammeln.length === 0 ? (
              <Text style={{ color: "#777" }}>Alles gesammelt – wow! 🎉</Text>
            ) : (
              zuSammeln.map((name) => <Chip key={name} label={name} variant="todo" />)
            )}
          </View>
        </View>

        {/* Optional: CTA zu Expedition/Region-Liste */}
        <Pressable
          onPress={() => {}}
          style={({ pressed }) => ({
            backgroundColor: "#222",
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: "center",
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>
            Expedition planen
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

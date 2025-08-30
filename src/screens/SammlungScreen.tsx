import React, { useMemo } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Image,
} from "react-native";
import regionsData from "../data/regions.json";
import { useFundContext } from "../context/FundContext";

type FossilEntry = string | { id: string; name: string };
type Region = {
  id: string;
  name: string;
  fossils: FossilEntry[];
  locations?: { id: string; name: string }[];
};

// Dummybilder
const DUMMY_COLOR = require("../../assets/fossils/dummy.png");
const DUMMY_GRAY = require("../../assets/fossils/dummy-gray.png");

export default function SammlungScreen() {
  const regions = regionsData as Region[];
  const { funds } = useFundContext();

  // Alle Fossilien einmalig und alphabetisch
  const fossils = useMemo(() => {
    const set = new Set<string>();
    regions.forEach((r) => {
      (r.fossils ?? []).forEach((f) => {
        const name = typeof f === "string" ? f : f.name;
        if (name) set.add(name);
      });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "de"));
  }, [regions]);

  // Gesammelt: Namen aus Funds
  const collectedSet = useMemo(() => {
    const s = new Set<string>();
    (funds ?? []).forEach((f) => {
      if (f?.fossil) s.add(String(f.fossil));
    });
    return s;
  }, [funds]);

  const Card: React.FC<{ name: string; collected: boolean }> = ({
    name,
    collected,
  }) => (
    <View
      style={{
        borderWidth: 1,
        borderColor: collected ? "#CFE8CF" : "#ddd",
        backgroundColor: "#fff",
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
      }}
    >
      <Image
        source={collected ? DUMMY_COLOR : DUMMY_GRAY}
        style={{ width: "100%", height: 160 }}
        resizeMode="cover"
      />
      <View style={{ padding: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 4 }}>
          {name}
        </Text>
        <Text style={{ color: collected ? "#225522" : "#555" }}>
          {collected ? "Gesammelt" : "Zu sammeln"}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 16 }}>
          Sammlung
        </Text>

        {fossils.map((name) => (
          <Card key={name} name={name} collected={collectedSet.has(name)} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

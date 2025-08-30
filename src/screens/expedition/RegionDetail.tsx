import React, { useMemo } from "react";
import { View, Text, SafeAreaView, FlatList, Image } from "react-native";
import { useRoute } from "@react-navigation/native";
import regionsData from "../../data/regions.json";
import { useFundContext } from "../../context/FundContext";

type Fossil = { id: string; name: string; image: string; imageGray: string };
type Region = {
  id: string;
  name: string;
  fossils: Fossil[] | (string[]);
  locations?: { id: string; name: string }[];
};

type RouteParams = { regionId: string };

// require()-Registry (dynamische Pfade sind nicht erlaubt)
const ASSET_REGISTRY: Record<string, any> = {
  "dummy.png": require("../../../assets/fossils/dummy.png"),
  "dummy-gray.png": require("../../../assets/fossils/dummy-gray.png"),
  "app_icon.png": require("../../../assets/app_icon.png"),
};

function resolveAsset(path?: string, fallbackFileName?: string) {
  const key = path?.split("/").pop() || "";
  if (key && ASSET_REGISTRY[key]) return ASSET_REGISTRY[key];
  if (fallbackFileName && ASSET_REGISTRY[fallbackFileName]) return ASSET_REGISTRY[fallbackFileName];
  return ASSET_REGISTRY["app_icon.png"];
}

export default function RegionDetail() {
  const route = useRoute();
  const { regionId } = (route.params || {}) as RouteParams;

  const regions = regionsData as Region[];
  const region = regions.find((r) => r.id === regionId);
  const { funds } = useFundContext();

  const collectedSet = useMemo(() => {
    const s = new Set<string>();
    (funds ?? []).forEach((f) => f?.fossil && s.add(String(f.fossil)));
    return s;
  }, [funds]);

  const fossils = useMemo<Fossil[]>(() => {
    const list: Fossil[] = [];
    (region?.fossils ?? []).forEach((f: any, idx: number) => {
      if (typeof f === "string") {
        list.push({
          id: `${region?.id}-${idx}-${f}`,
          name: f,
          image: "assets/fossils/dummy.png",
          imageGray: "assets/fossils/dummy-gray.png",
        });
      } else {
        list.push(f);
      }
    });
    // alphabetisch nach Namen
    return list.sort((a, b) => a.name.localeCompare(b.name, "de"));
  }, [region]);

  if (!region) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Region nicht gefunden.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <FlatList
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        data={fossils}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>
            {region.name}
          </Text>
        }
        renderItem={({ item }) => {
          const isCollected = collectedSet.has(item.name);
          const img = resolveAsset(isCollected ? item.image : item.imageGray, isCollected ? "app_icon.png" : "dummy-gray.png");
          return (
            <View
              style={{
                borderWidth: 1,
                borderColor: isCollected ? "#CFE8CF" : "#E5E7EB",
                backgroundColor: "#fff",
                borderRadius: 16,
                overflow: "hidden",
                marginBottom: 12,
              }}
            >
              <Image
                source={img}
                style={{ width: "100%", height: 140 }}
                resizeMode="cover"
              />
              <View style={{ padding: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: "700" }}>{item.name}</Text>
                <Text style={{ color: isCollected ? "#225522" : "#555" }}>
                  {isCollected ? "Gesammelt" : "Zu sammeln"}
                </Text>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}
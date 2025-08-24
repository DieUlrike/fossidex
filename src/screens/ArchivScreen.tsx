import { View, Text, FlatList } from "react-native";
import { useFundContext } from "../context/FundContext";

export default function ArchivScreen() {
  const { funds } = useFundContext();

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, marginBottom: 12 }}>Archiv</Text>
      {funds.length === 0 ? (
        <Text style={{ color: "#666" }}>Noch keine Funde gespeichert.</Text>
      ) : (
        <FlatList
          data={funds}
          keyExtractor={(item) => item.id}
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
              <Text style={{ fontWeight: "600" }}>{item.fossil}</Text>
              <Text>Region: {item.regionId}</Text>
              {item.locationId ? <Text>Location: {item.locationId}</Text> : null}
              {item.newLocationName ? <Text>Neue Location: {item.newLocationName}</Text> : null}
              {item.date ? <Text>Datum: {item.date}</Text> : null}
              {item.note ? <Text>Notiz: {item.note}</Text> : null}
            </View>
          )}
        />
      )}
    </View>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRoute } from "@react-navigation/native";
// FundForm liegt in src/screens/funde/, data liegt parallel zu screens/
import regionsData from "../../data/regions.json";

type Region = {
  id: string;
  name: string;
  fossils: string[];
  locations?: { id: string; name: string }[];
};

type RouteParams = Partial<{
  regionId: string;
  locationId: string;
  fossilName: string;
}>;

export default function FundForm() {
  const route = useRoute();
  const params = (route.params || {}) as RouteParams;

  const regions = regionsData as Region[];

  // Alle Fossilien (global) – nur für den Fall, dass keine Region gewählt ist
  const allFossils = useMemo(() => {
    const set = new Set<string>();
    regions.forEach((r) => r.fossils.forEach((f) => set.add(f)));
    return Array.from(set).sort();
  }, [regions]);

  // State
  const [selectedRegionId, setSelectedRegionId] = useState<string>("");
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [selectedFossil, setSelectedFossil] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [date, setDate] = useState<string>("");

  // Vorbelegung aus Route-Params (wenn von „Gefunden!“ gekommen)
  useEffect(() => {
    if (params.regionId) setSelectedRegionId(params.regionId);
    if (params.locationId) setSelectedLocationId(params.locationId);
    if (params.fossilName) setSelectedFossil(params.fossilName);
  }, [params.regionId, params.locationId, params.fossilName]);

  // Abgeleitete Listen
  const region = regions.find((r) => r.id === selectedRegionId);
  const locationOptions = region?.locations ?? [];
  const fossilOptions = selectedRegionId ? region?.fossils ?? [] : allFossils;

  // Konsistenz: Wenn Region wechselt → Location/Fossil zurücksetzen
  useEffect(() => {
    setSelectedLocationId("");
    // Wenn vorher ein Fossil gewählt war, das nicht in der neuen Region existiert, zurücksetzen
    if (selectedFossil && region && !region.fossils.includes(selectedFossil)) {
      setSelectedFossil("");
    }
  }, [selectedRegionId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = () => {
    if (!selectedFossil) {
      Alert.alert("Hinweis", "Bitte ein Fossil auswählen.");
      return;
    }
    if (!selectedRegionId) {
      Alert.alert("Hinweis", "Bitte eine Region auswählen.");
      return;
    }
    // (Location ist optional – darf leer sein)
    console.log("Neuer Fund (noch nicht persistent):", {
      regionId: selectedRegionId,
      locationId: selectedLocationId || null,
      fossil: selectedFossil,
      date,
      note,
    });
    Alert.alert("Gespeichert", "Fund erfasst (noch nicht dauerhaft).");
    // später: hier in zentralen State/SQLite speichern
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, marginBottom: 16 }}>Neuen Fund hinzufügen</Text>

      {/* Region */}
      <Text style={{ marginBottom: 8 }}>Region:</Text>
      <Picker
        selectedValue={selectedRegionId}
        onValueChange={(v) => setSelectedRegionId(v)}
        style={{ marginBottom: 16 }}
      >
        <Picker.Item label="Bitte wählen..." value="" />
        {regions.map((r) => (
          <Picker.Item key={r.id} label={r.name} value={r.id} />
        ))}
      </Picker>

      {/* Location (abhängig von Region, optional) */}
      <Text style={{ marginBottom: 8 }}>Location (optional):</Text>
      <Picker
        enabled={!!selectedRegionId && locationOptions.length > 0}
        selectedValue={selectedLocationId}
        onValueChange={(v) => setSelectedLocationId(v)}
        style={{ marginBottom: 16 }}
      >
        <Picker.Item
          label={
            !selectedRegionId
              ? "Zuerst Region wählen"
              : locationOptions.length
              ? "Keine Angabe"
              : "In dieser Region keine Locations hinterlegt"
          }
          value=""
        />
        {locationOptions.map((loc) => (
          <Picker.Item key={loc.id} label={loc.name} value={loc.id} />
        ))}
      </Picker>

      {/* Fossil */}
      <Text style={{ marginBottom: 8 }}>Fossil:</Text>
      <Picker
        selectedValue={selectedFossil}
        onValueChange={(v) => setSelectedFossil(v)}
        style={{ marginBottom: 16 }}
      >
        <Picker.Item label="Bitte wählen..." value="" />
        {fossilOptions.map((f) => (
          <Picker.Item key={f} label={f} value={f} />
        ))}
      </Picker>

      {/* Notiz */}
      <Text style={{ marginBottom: 8 }}>Notiz:</Text>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="z. B. Fund nach Sturm an der Spülsaumkante"
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 8,
          marginBottom: 16,
        }}
      />

      {/* Datum */}
      <Text style={{ marginBottom: 8 }}>Datum:</Text>
      <TextInput
        value={date}
        onChangeText={setDate}
        placeholder="JJJJ-MM-TT"
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 8,
          marginBottom: 16,
        }}
      />

      <Button title="Speichern" onPress={handleSave} />
    </View>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRoute } from "@react-navigation/native";

// Daten & Context
import regionsData from "../../data/regions.json";
import { useFundContext } from "../../context/FundContext";

type Region = {
  id: string;
  name: string;
  fossils: string[];
  locations?: { id: string; name: string }[];
};

type RouteParams = Partial<{
  fossilName: string;
  regionId: string;
  locationId: string;
}>;

const NEW_LOCATION_VALUE = "__new_location__";

export default function FundForm() {
  const route = useRoute();
  const params = (route.params || {}) as RouteParams;

  const regions = regionsData as Region[];
  const { addFund } = useFundContext();

  // Alle Fossilien global (alphabetisch) – Fossil ist frei wählbar
  const allFossils = useMemo(() => {
    const set = new Set<string>();
    regions.forEach((r) => r.fossils.forEach((f) => set.add(f)));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "de"));
  }, [regions]);

  // Alle Locations (inkl. regionId) – zum Ableiten, falls nur Location vorgegeben ist
  const allLocations = useMemo(
    () => regions.flatMap((r) => (r.locations ?? []).map((l) => ({ ...l, regionId: r.id }))),
    [regions]
  );

  // State
  const [fossil, setFossil] = useState<string>("");
  const [regionId, setRegionId] = useState<string>("");
  const [locationId, setLocationId] = useState<string>("");
  const [newLocationName, setNewLocationName] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [date, setDate] = useState<string>("");

  // Vorbelegung aus Params (z. B. aus „Gefunden!“)
  useEffect(() => {
    if (params.fossilName) setFossil(params.fossilName);
    if (params.locationId) {
      setLocationId(params.locationId);
      const loc = allLocations.find((l) => l.id === params.locationId);
      if (loc) setRegionId(loc.regionId);
    } else if (params.regionId) {
      setRegionId(params.regionId);
    }
  }, [params.fossilName, params.regionId, params.locationId, allLocations]);

  // Location-Optionen hängen nur von der gewählten Region ab
  const possibleLocations = useMemo(() => {
    const r = regions.find((x) => x.id === regionId);
    return r?.locations ?? [];
  }, [regions, regionId]);

  // Konsistenz: bei Regionswechsel Location zurücksetzen
  useEffect(() => {
    setLocationId("");
    setNewLocationName("");
  }, [regionId]);

  // Falls Nutzer manuell eine Location wählt, die einer anderen Region angehört → Region automatisch anpassen
  useEffect(() => {
    if (!locationId || locationId === NEW_LOCATION_VALUE) return;
    const loc = allLocations.find((l) => l.id === locationId);
    if (loc && loc.regionId !== regionId) {
      setRegionId(loc.regionId);
    }
  }, [locationId, regionId, allLocations]);

  // Hinweis: Ist Fossil in der gewählten Region „typisch“? (nur Hinweis, keine Blockade)
  const isTypicalHere = useMemo(() => {
    if (!fossil || !regionId) return null;
    const r = regions.find((x) => x.id === regionId);
    return r ? r.fossils.includes(fossil) : null;
  }, [fossil, regionId, regions]);

  const handleSave = () => {
    if (!fossil) {
      Alert.alert("Hinweis", "Bitte ein Fossil auswählen.");
      return;
    }
    if (!regionId) {
      Alert.alert("Hinweis", "Bitte eine Region auswählen.");
      return;
    }
    if (locationId === NEW_LOCATION_VALUE && !newLocationName.trim()) {
      Alert.alert("Hinweis", "Bitte den Namen der neuen Location eingeben.");
      return;
    }

    const payload = {
      fossil,
      regionId,
      locationId: locationId && locationId !== NEW_LOCATION_VALUE ? locationId : null,
      newLocationName: locationId === NEW_LOCATION_VALUE ? newLocationName.trim() : null,
      date,
      note,
    };

    addFund(payload); // <-- zentral speichern
    Alert.alert("Gespeichert", "Fund erfasst!");

    // Einfacher Reset (optional)
    setFossil("");
    setRegionId("");
    setLocationId("");
    setNewLocationName("");
    setNote("");
    setDate("");
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, marginBottom: 16 }}>Neuen Fund hinzufügen</Text>

      {/* Fossil (frei wählbar) */}
      <Text style={{ marginBottom: 8 }}>Fossil:</Text>
      <Picker selectedValue={fossil} onValueChange={setFossil} style={{ marginBottom: 16 }}>
        <Picker.Item label="Bitte wählen..." value="" />
        {allFossils.map((f) => (
          <Picker.Item key={f} label={f} value={f} />
        ))}
      </Picker>

      {/* Region (frei wählbar) */}
      <Text style={{ marginBottom: 8 }}>Region:</Text>
      <Picker selectedValue={regionId} onValueChange={setRegionId} style={{ marginBottom: 8 }}>
        <Picker.Item label="Bitte wählen..." value="" />
        {regions.map((r) => (
          <Picker.Item key={r.id} label={r.name} value={r.id} />
        ))}
      </Picker>

      {/* Hinweis, wenn Kombination untypisch ist */}
      {isTypicalHere === false && fossil && regionId ? (
        <Text style={{ color: "#a66", marginBottom: 12 }}>
          Hinweis: „{fossil}“ ist für „{regions.find((r) => r.id === regionId)?.name}“ nicht in der Typenliste.
          Du kannst den Fund trotzdem speichern.
        </Text>
      ) : (
        <View style={{ height: 12 }} />
      )}

      {/* Location (optional, abhängig von Region) */}
      <Text style={{ marginBottom: 8 }}>Location (optional):</Text>
      <Picker
        enabled={!!regionId}
        selectedValue={locationId}
        onValueChange={setLocationId}
        style={{ marginBottom: 8 }}
      >
        <Picker.Item label={regionId ? "Keine Angabe" : "Zuerst Region wählen"} value="" />
        {possibleLocations.map((loc) => (
          <Picker.Item key={loc.id} label={loc.name} value={loc.id} />
        ))}
        {regionId ? <Picker.Item label="➕ Neue Location anlegen…" value={NEW_LOCATION_VALUE} /> : null}
      </Picker>

      {locationId === NEW_LOCATION_VALUE ? (
        <TextInput
          placeholder="Name der neuen Location"
          value={newLocationName}
          onChangeText={setNewLocationName}
          style={{ borderWidth: 1, borderColor: "#ccc", padding: 8, marginBottom: 16 }}
        />
      ) : (
        <View style={{ height: 16 }} />
      )}

      {/* Notiz */}
      <Text style={{ marginBottom: 8 }}>Notiz:</Text>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="z. B. Fund nach Sturm an der Spülsaumkante"
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 8, marginBottom: 16 }}
      />

      {/* Datum */}
      <Text style={{ marginBottom: 8 }}>Datum:</Text>
      <TextInput
        value={date}
        onChangeText={setDate}
        placeholder="JJJJ-MM-TT"
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 8, marginBottom: 16 }}
      />

      <Button title="Speichern" onPress={handleSave} />
    </View>
  );
}
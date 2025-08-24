// src/screens/funde/FundForm.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  ScrollView,
  SafeAreaView,
  Pressable,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRoute } from "@react-navigation/native";
import regionsData from "../../data/regions.json";
import { useFundContext } from "../../context/FundContext";

type Region = { id: string; name: string; fossils: string[]; locations?: { id: string; name: string }[] };
type RouteParams = Partial<{ fossilName: string; regionId: string; locationId: string }>;
const NEW_LOCATION_VALUE = "__new_location__";
const PICKER_HEIGHT = Platform.OS === "ios" ? 216 : 48; // <- wichtig

export default function FundForm() {
  const route = useRoute();
  const params = (route.params || {}) as RouteParams;

  const regions = regionsData as Region[];
  const { addFund } = useFundContext();

  const allFossils = useMemo(() => {
    const set = new Set<string>();
    regions.forEach(r => r.fossils.forEach(f => set.add(f)));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "de"));
  }, [regions]);

  const allLocations = useMemo(
    () => regions.flatMap(r => (r.locations ?? []).map(l => ({ ...l, regionId: r.id }))),
    [regions]
  );

  const [fossil, setFossil] = useState("");
  const [regionId, setRegionId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [newLocationName, setNewLocationName] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (params.fossilName) setFossil(params.fossilName);
    if (params.locationId) {
      setLocationId(params.locationId);
      const loc = allLocations.find(l => l.id === params.locationId);
      if (loc) setRegionId(loc.regionId);
    } else if (params.regionId) {
      setRegionId(params.regionId);
    }
  }, [params.fossilName, params.regionId, params.locationId, allLocations]);

  const possibleLocations = useMemo(() => {
    const r = regions.find(x => x.id === regionId);
    return r?.locations ?? [];
  }, [regions, regionId]);

  useEffect(() => {
    setLocationId("");
    setNewLocationName("");
  }, [regionId]);

  useEffect(() => {
    if (!locationId || locationId === NEW_LOCATION_VALUE) return;
    const loc = allLocations.find(l => l.id === locationId);
    if (loc && loc.regionId !== regionId) setRegionId(loc.regionId);
  }, [locationId, regionId, allLocations]);

  const isTypicalHere = useMemo(() => {
    if (!fossil || !regionId) return null;
    const r = regions.find(x => x.id === regionId);
    return r ? r.fossils.includes(fossil) : null;
  }, [fossil, regionId, regions]);

  const handleSave = () => {
    if (!fossil) return Alert.alert("Hinweis", "Bitte ein Fossil auswählen.");
    if (!regionId) return Alert.alert("Hinweis", "Bitte eine Region auswählen.");
    if (locationId === NEW_LOCATION_VALUE && !newLocationName.trim()) {
      return Alert.alert("Hinweis", "Bitte den Namen der neuen Location eingeben.");
    }

    addFund({
      fossil,
      regionId,
      locationId: locationId && locationId !== NEW_LOCATION_VALUE ? locationId : null,
      newLocationName: locationId === NEW_LOCATION_VALUE ? newLocationName.trim() : null,
      date,
      note,
    });
    Alert.alert("Gespeichert", "Fund erfasst!");
  };

  const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ marginBottom: 8, fontWeight: "600" }}>{label}</Text>
      {children}
    </View>
  );

  const PickerBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <View
      style={{
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: "#f7f7f8",
        height: PICKER_HEIGHT,            // <- reserviert Platz für das iOS‑Wheel
        justifyContent: "center",
      }}
    >
      {children}
    </View>
  );

  const ButtonPrimary: React.FC<{ title: string; onPress: () => void }> = ({ title, onPress }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: "#222",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        opacity: pressed ? 0.85 : 1,
      })}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>{title}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 16 }}>
          Neuen Fund hinzufügen
        </Text>

        <Field label="Fossil">
          <PickerBox>
            <Picker selectedValue={fossil} onValueChange={setFossil}>
              <Picker.Item label="Bitte wählen..." value="" />
              {allFossils.map(f => (
                <Picker.Item key={f} label={f} value={f} />
              ))}
            </Picker>
          </PickerBox>
        </Field>

        <Field label="Region">
          <PickerBox>
            <Picker selectedValue={regionId} onValueChange={setRegionId}>
              <Picker.Item label="Bitte wählen..." value="" />
              {regions.map(r => (
                <Picker.Item key={r.id} label={r.name} value={r.id} />
              ))}
            </Picker>
          </PickerBox>

          {isTypicalHere === false && fossil && regionId ? (
            <Text style={{ color: "#a66", marginTop: 8 }}>
              Hinweis: „{fossil}“ ist für „{regions.find(r => r.id === regionId)?.name}“ nicht typisch.
            </Text>
          ) : null}
        </Field>

        <Field label="Location (optional)">
          <PickerBox>
            <Picker
              enabled={!!regionId}
              selectedValue={locationId}
              onValueChange={setLocationId}
            >
              <Picker.Item label={regionId ? "Keine Angabe" : "Zuerst Region wählen"} value="" />
              {possibleLocations.map(loc => (
                <Picker.Item key={loc.id} label={loc.name} value={loc.id} />
              ))}
              {regionId ? <Picker.Item label="➕ Neue Location anlegen…" value={NEW_LOCATION_VALUE} /> : null}
            </Picker>
          </PickerBox>

          {locationId === NEW_LOCATION_VALUE ? (
            <TextInput
              placeholder="Name der neuen Location"
              value={newLocationName}
              onChangeText={setNewLocationName}
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                padding: 10,
                borderRadius: 8,
                marginTop: 12,
              }}
            />
          ) : null}
        </Field>

        <Field label="Notiz">
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="z. B. Fund nach Sturm an der Spülsaumkante"
            style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 8 }}
          />
        </Field>

        <Field label="Datum">
          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="JJJJ-MM-TT"
            style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 8 }}
          />
        </Field>
      </ScrollView>

      {/* fester Footer-Button */}
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: 16,
          backgroundColor: "rgba(255,255,255,0.95)",
          borderTopWidth: 1,
          borderTopColor: "#eee",
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -2 },
        }}
      >
        <ButtonPrimary title="Speichern" onPress={handleSave} />
      </View>
    </SafeAreaView>
  );
}
// src/screens/funde/FundForm.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  SafeAreaView,
  Pressable,
  Platform,
  ScrollView,
  Modal,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRoute } from "@react-navigation/native";

import regionsData from "../../data/regions.json";
import { useFundContext } from "../../context/FundContext";

type Region = {
  id: string;
  name: string;
  fossils: string[];
  locations?: { id: string; name: string }[];
};
type RouteParams = Partial<{ fossilName: string; regionId: string; locationId: string }>;

const NEW_LOCATION_VALUE = "__new_location__";
const PICKER_HEIGHT = Platform.OS === "ios" ? 216 : 48;

export default function FundForm() {
  const route = useRoute();
  const params = (route.params || {}) as RouteParams;

  const regions = regionsData as Region[];
  const { addFund } = useFundContext();

  const allFossils = useMemo(() => {
    const set = new Set<string>();
    regions.forEach((r) => r.fossils.forEach((f) => set.add(f)));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "de"));
  }, [regions]);

  const allLocations = useMemo(
    () => regions.flatMap((r) => (r.locations ?? []).map((l) => ({ ...l, regionId: r.id }))),
    [regions]
  );

  // ---- Form State ----
  const [fossil, setFossil] = useState("");
  const [regionId, setRegionId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [newLocationName, setNewLocationName] = useState("");

  // Notiz im Modal
  const [note, setNote] = useState("");
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");

  // Datum über drei Picker (YYYY-MM-DD)
  const now = new Date();
  const [year, setYear] = useState<number>(now.getFullYear());
  const [month, setMonth] = useState<number>(now.getMonth() + 1); // 1-12
  const [day, setDay] = useState<number>(now.getDate());

  // Prefill aus Navigation
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

  const possibleLocations = useMemo(() => {
    const r = regions.find((x) => x.id === regionId);
    return r?.locations ?? [];
  }, [regions, regionId]);

  // Location reset, wenn Region wechselt
  useEffect(() => {
    setLocationId("");
  }, [regionId]);

  // Wenn vorhandene Location einer anderen Region gewählt wird → Region anpassen
  useEffect(() => {
    if (!locationId || locationId === NEW_LOCATION_VALUE) return;
    const loc = allLocations.find((l) => l.id === locationId);
    if (loc && loc.regionId !== regionId) setRegionId(loc.regionId);
  }, [locationId, regionId, allLocations]);

  // Datum: Tage pro Monat
  const daysInMonth = useMemo(() => {
    const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
    const map: Record<number, number> = {
      1: 31, 2: isLeap(year) ? 29 : 28, 3: 31, 4: 30,
      5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31,
    };
    return map[month] ?? 30;
  }, [year, month]);

  useEffect(() => {
    if (day > daysInMonth) setDay(daysInMonth);
  }, [daysInMonth, day]);

  const isTypicalHere = useMemo(() => {
    if (!fossil || !regionId) return null;
    const r = regions.find((x) => x.id === regionId);
    return r ? r.fossils.includes(fossil) : null;
  }, [fossil, regionId, regions]);

  const buildDateString = () => {
    const mm = String(month).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
    // Hinweis: wir speichern als ISO YYYY-MM-DD
  };

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
      date: buildDateString(),
      note,
    });
    Alert.alert("Gespeichert", "Fund erfasst!");
  };

  // ---- UI Helfer ----
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
        height: PICKER_HEIGHT,
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

  const ButtonGhost: React.FC<{ title: string; onPress: () => void }> = ({ title, onPress }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: "transparent",
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 10,
        alignItems: "center",
        opacity: pressed ? 0.6 : 1,
      })}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <Text style={{ color: "#222", fontSize: 16, fontWeight: "600" }}>{title}</Text>
    </Pressable>
  );

  // Jahr/Monat/Tag-Optionen
  const years = useMemo(() => {
    const list: number[] = [];
    const maxY = now.getFullYear();
    for (let y = maxY; y >= 1900; y--) list.push(y);
    return list;
  }, [now]);

  const months = [
    { v: 1, l: "01" }, { v: 2, l: "02" }, { v: 3, l: "03" }, { v: 4, l: "04" },
    { v: 5, l: "05" }, { v: 6, l: "06" }, { v: 7, l: "07" }, { v: 8, l: "08" },
    { v: 9, l: "09" }, { v: 10, l: "10" }, { v: 11, l: "11" }, { v: 12, l: "12" },
  ];
  const days = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 16 }}>
          Neuen Fund hinzufügen
        </Text>

        {/* Fossil */}
        <Field label="Fossil">
          <PickerBox>
            <Picker selectedValue={fossil} onValueChange={setFossil}>
              <Picker.Item label="Bitte wählen..." value="" />
              {allFossils.map((f) => (
                <Picker.Item key={f} label={f} value={f} />
              ))}
            </Picker>
          </PickerBox>
        </Field>

        {/* Region */}
        <Field label="Region">
          <PickerBox>
            <Picker selectedValue={regionId} onValueChange={setRegionId}>
              <Picker.Item label="Bitte wählen..." value="" />
              {regions.map((r) => (
                <Picker.Item key={r.id} label={r.name} value={r.id} />
              ))}
            </Picker>
          </PickerBox>

          {isTypicalHere === false && fossil && regionId ? (
            <Text style={{ color: "#a66", marginTop: 8 }}>
              Hinweis: „{fossil}“ ist für „{regions.find((r) => r.id === regionId)?.name}“ nicht typisch.
            </Text>
          ) : null}
        </Field>

        {/* Location */}
        <Field label="Location (optional)">
          <PickerBox>
            <Picker
              enabled={!!regionId}
              selectedValue={locationId}
              onValueChange={setLocationId}
            >
              <Picker.Item label={regionId ? "Keine Angabe" : "Zuerst Region wählen"} value="" />
              {possibleLocations.map((loc) => (
                <Picker.Item key={loc.id} label={loc.name} value={loc.id} />
              ))}
              {regionId ? (
                <Picker.Item label="➕ Neue Location anlegen…" value={NEW_LOCATION_VALUE} />
              ) : null}
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

        {/* Notiz (öffnet Modal) */}
        <Field label="Notiz">
          <Pressable
            onPress={() => {
              setNoteDraft(note);
              setNoteModalVisible(true);
            }}
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              padding: 12,
              borderRadius: 8,
              minHeight: 44,
              justifyContent: "center",
            }}
          >
            <Text style={{ color: note ? "#111" : "#888" }}>
              {note || "Tippen zum Bearbeiten…"}
            </Text>
          </Pressable>
        </Field>

        {/* Datum (Jahr/Monat/Tag) */}
        <Field label="Datum">
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}>
              <PickerBox>
                <Picker selectedValue={year} onValueChange={(y) => setYear(Number(y))}>
                  {years.map((y) => (
                    <Picker.Item key={y} label={String(y)} value={y} />
                  ))}
                </Picker>
              </PickerBox>
            </View>
            <View style={{ width: 120 }}>
              <PickerBox>
                <Picker selectedValue={month} onValueChange={(m) => setMonth(Number(m))}>
                  {months.map((m) => (
                    <Picker.Item key={m.v} label={m.l} value={m.v} />
                  ))}
                </Picker>
              </PickerBox>
            </View>
            <View style={{ width: 120 }}>
              <PickerBox>
                <Picker selectedValue={day} onValueChange={(d) => setDay(Number(d))}>
                  {days.map((d) => (
                    <Picker.Item key={d} label={String(d).padStart(2, "0")} value={d} />
                  ))}
                </Picker>
              </PickerBox>
            </View>
          </View>
          <Text style={{ marginTop: 8, color: "#666" }}>
            Ausgewählt: {buildDateString()}
          </Text>
        </Field>

        {/* Speichern */}
        <View style={{ marginTop: 8 }}>
          <ButtonPrimary title="Speichern" onPress={handleSave} />
        </View>
      </ScrollView>

      {/* Vollbild-Modal für Notiz */}
      <Modal
        visible={noteModalVisible}
        animationType="none"
        presentationStyle="fullScreen"
        onRequestClose={() => setNoteModalVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <View
            style={{
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 8,
              borderBottomWidth: 1,
              borderBottomColor: "#eee",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <ButtonGhost title="Abbrechen" onPress={() => setNoteModalVisible(false)} />
            <Text style={{ fontWeight: "700", fontSize: 16 }}>Notiz bearbeiten</Text>
            <ButtonGhost
              title="Fertig"
              onPress={() => {
                setNote(noteDraft.trim());
                setNoteModalVisible(false);
              }}
            />
          </View>

          <View style={{ flex: 1, padding: 16 }}>
            <TextInput
              autoFocus
              multiline
              value={noteDraft}
              onChangeText={setNoteDraft}
              placeholder="z. B. Fund nach Sturm an der Spülsaumkante"
              textAlignVertical="top"
              blurOnSubmit={false}
              autoCorrect={false}
              spellCheck={false}
              autoComplete="off"
              textContentType="none"
              style={{
                borderWidth: 1,
                borderColor: "#bbb",
                borderRadius: 10,
                padding: 12,
                flex: 1,
                minHeight: 220,
              }}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

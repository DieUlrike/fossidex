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

  // ---------- Formular-States ----------
  const [fossil, setFossil] = useState("");
  const [regionId, setRegionId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [newLocationName, setNewLocationName] = useState("");

  // Notiz wird in einem Modal ohne ScrollView editiert (stabil auf iOS)
  const [note, setNote] = useState("");
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");

  // Datum über drei Picker (keine Tastatur)
  const [year, setYear] = useState("");
  const [month, setMonth] = useState(""); // "01".."12"
  const [day, setDay] = useState("");     // "01".."31"

  // abgeleitet: gültiges Datum als YYYY-MM-DD (oder "")
  const fullDate = useMemo(() => {
    if (!year || !month || !day) return "";
    return `${year}-${month}-${day}`;
  }, [year, month, day]);

  // ---------- Prefill aus Navigation ----------
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

  // Bei Regionswechsel zugehörige Location zurücksetzen
  useEffect(() => {
    setLocationId("");
  }, [regionId]);

  // Wenn existierende Location anderer Region gewählt wird → Region angleichen
  useEffect(() => {
    if (!locationId || locationId === NEW_LOCATION_VALUE) return;
    const loc = allLocations.find((l) => l.id === locationId);
    if (loc && loc.regionId !== regionId) setRegionId(loc.regionId);
  }, [locationId, regionId, allLocations]);

  // Hinweis „typisch“/„untypisch“
  const isTypicalHere = useMemo(() => {
    if (!fossil || !regionId) return null;
    const r = regions.find((x) => x.id === regionId);
    return r ? r.fossils.includes(fossil) : null;
  }, [fossil, regionId, regions]);

  // ---------- Datum: Hilfen ----------
  const currentYear = new Date().getFullYear();
  const years = useMemo(() => {
    // 150 Jahre zurück bis aktuellem Jahr
    return Array.from({ length: 151 }, (_, i) => (currentYear - i).toString());
  }, [currentYear]);

  const months = useMemo(() => {
    return ["01","02","03","04","05","06","07","08","09","10","11","12"];
  }, []);

  const daysInSelectedMonth = useMemo(() => {
    if (!year || !month) return 31;
    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    // Trick: Tag 0 des Folgemonats ist letzter Tag des gewünschten Monats
    return new Date(y, m, 0).getDate();
  }, [year, month]);

  const days = useMemo(() => {
    return Array.from({ length: daysInSelectedMonth }, (_, i) => (i + 1).toString().padStart(2, "0"));
  }, [daysInSelectedMonth]);

  // Falls Monat/Jahr so geändert wurden, dass der bisherige Tag zu groß wäre → Tag resetten
  useEffect(() => {
    if (!day) return;
    const d = parseInt(day, 10);
    if (d > daysInSelectedMonth) setDay("");
  }, [daysInSelectedMonth, day]);

  // ---------- Speichern ----------
  const handleSave = () => {
    if (!fossil) return Alert.alert("Hinweis", "Bitte ein Fossil auswählen.");
    if (!regionId) return Alert.alert("Hinweis", "Bitte eine Region auswählen.");
    if (locationId === NEW_LOCATION_VALUE && !newLocationName.trim()) {
      return Alert.alert("Hinweis", "Bitte den Namen der neuen Location eingeben.");
    }
    // Datum ist optional – wenn unvollständig, speichern wir leeren String
    const date = fullDate;

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

  // ---------- UI Helfer ----------
  const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ marginBottom: 8, fontWeight: "600" }}>{label}</Text>
      {children}
    </View>
  );

  const PickerBox: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => (
    <View
      style={[
        {
          borderWidth: 1,
          borderColor: "#ddd",
          borderRadius: 12,
          overflow: "hidden",
          backgroundColor: "#f7f7f8",
          height: PICKER_HEIGHT,
          justifyContent: "center",
          flex: 1,
        },
        style,
      ]}
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

  const DisplayField: React.FC<{ value: string; placeholder: string; onPress: () => void }> = ({
    value,
    placeholder,
    onPress,
  }) => (
    <Pressable
      onPress={onPress}
      style={{
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 12,
        borderRadius: 8,
        minHeight: 44,
        justifyContent: "center",
      }}
    >
      <Text style={{ color: value ? "#111" : "#888" }}>{value || placeholder}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Scrollen erlaubt, aber KEINE Tastatur im Scroll-Bereich (Notiz geht per Modal) */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        contentInsetAdjustmentBehavior="always"
      >
        <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 16 }}>
          Neuen Fund hinzufügen
        </Text>

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
              blurOnSubmit={false}
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

        {/* Notiz als klickbares Feld → Modal zum Bearbeiten (kein Keyboard im Scrollbereich) */}
        <Field label="Notiz">
          <DisplayField
            value={note}
            placeholder="Tippen zum Bearbeiten…"
            onPress={() => {
              setNoteDraft(note);
              setNoteModalVisible(true);
            }}
          />
        </Field>

        {/* Datum: drei Picker (Jahr / Monat / Tag), keine Tastatur */}
        <Field label="Datum">
          <View style={{ flexDirection: "row", gap: 8 }}>
            <PickerBox style={{ flex: 1.2 }}>
              <Picker
                selectedValue={year}
                onValueChange={(val) => setYear(val)}
              >
                <Picker.Item label="Jahr" value="" />
                {years.map((y) => (
                  <Picker.Item key={y} label={y} value={y} />
                ))}
              </Picker>
            </PickerBox>

            <PickerBox style={{ flex: 1 }}>
              <Picker
                selectedValue={month}
                onValueChange={(val) => setMonth(val)}
                enabled={!!year}
              >
                <Picker.Item label="Monat" value="" />
                {months.map((m, idx) => (
                  <Picker.Item
                    key={m}
                    label={`${(idx + 1).toString().padStart(2, "0")}`}
                    value={m}
                  />
                ))}
              </Picker>
            </PickerBox>

            <PickerBox style={{ flex: 1 }}>
              <Picker
                selectedValue={day}
                onValueChange={(val) => setDay(val)}
                enabled={!!year && !!month}
              >
                <Picker.Item label="Tag" value="" />
                {days.map((d) => (
                  <Picker.Item key={d} label={d} value={d} />
                ))}
              </Picker>
            </PickerBox>
          </View>

          {/* Anzeige des zusammengesetzten Datums */}
          <Text style={{ marginTop: 8, color: fullDate ? "#111" : "#888" }}>
            {fullDate || "Kein Datum ausgewählt"}
          </Text>
        </Field>

        <View style={{ marginTop: 8 }}>
          <ButtonPrimary title="Speichern" onPress={handleSave} />
        </View>
      </ScrollView>

      {/* -------- Modal-Editor: Notiz (tastaturstabil) -------- */}
      <Modal visible={noteModalVisible} animationType="slide" presentationStyle="pageSheet">
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
                setNote(noteDraft);
                setNoteModalVisible(false);
              }}
            />
          </View>

          <View style={{ padding: 16 }}>
            <TextInput
              autoFocus
              multiline
              value={noteDraft}
              onChangeText={setNoteDraft}
              placeholder="z. B. Fund nach Sturm an der Spülsaumkante"
              textAlignVertical="top"
              style={{
                borderWidth: 1,
                borderColor: "#bbb",
                borderRadius: 10,
                padding: 12,
                minHeight: 220,
              }}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

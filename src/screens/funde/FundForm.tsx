import React, { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { Picker } from "@react-native-picker/picker";

export default function FundForm() {
  const [selectedFossil, setSelectedFossil] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [date, setDate] = useState<string>("");

  // Dummy-Fossilien für Auswahl (später aus JSON oder State)
  const fossilOptions = ["Ammonit", "Donnerkeil", "Bernstein", "Trilobit"];

  const handleSave = () => {
    console.log("Neuer Fund:", {
      fossil: selectedFossil,
      note,
      date,
    });
    alert("Fund gespeichert (noch nicht dauerhaft)!");
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, marginBottom: 16 }}>
        Neuen Fund hinzufügen
      </Text>

      {/* Fossil-Auswahl */}
      <Text style={{ marginBottom: 8 }}>Fossil:</Text>
      <Picker
        selectedValue={selectedFossil}
        onValueChange={(itemValue) => setSelectedFossil(itemValue)}
        style={{ marginBottom: 16 }}
      >
        <Picker.Item label="Bitte wählen..." value="" />
        {fossilOptions.map((fossil) => (
          <Picker.Item key={fossil} label={fossil} value={fossil} />
        ))}
      </Picker>

      {/* Notiz */}
      <Text style={{ marginBottom: 8 }}>Notiz:</Text>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="z. B. Fund am Strand bei Sturm"
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

      {/* Speichern */}
      <Button title="Speichern" onPress={handleSave} />
    </View>
  );
}
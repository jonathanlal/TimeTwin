
import { Text, View, Pressable } from "react-native";
export default function Home() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 48, fontVariant: ["tabular-nums"] }}>00:00</Text>
      <Pressable style={{ marginTop: 24, padding: 16, backgroundColor: "#FF3B30", borderRadius: 12 }}>
        <Text style={{ color: "white", fontSize: 18 }}>Waiting…</Text>
      </Pressable>
    </View>
  );
}

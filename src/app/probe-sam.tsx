import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";

interface ProbeResult {
  readonly ok: boolean;
  readonly message: string;
  readonly detail?: string;
}

export default function ProbeSamScreen() {
  const [result, setResult] = useState<ProbeResult | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const ort = await import("onnxruntime-react-native");
        const version = (
          ort as { Tensor?: unknown; env?: { versions?: { common?: string } } }
        ).env?.versions?.common;
        const hasInferenceSession =
          typeof ort.InferenceSession?.create === "function";
        setResult({
          ok: hasInferenceSession,
          message: hasInferenceSession
            ? "onnxruntime-react-native bridge loaded."
            : "Module imported but InferenceSession.create missing.",
          detail: `version: ${version ?? "unknown"}`,
        });
      } catch (err) {
        setResult({
          ok: false,
          message: "Failed to load onnxruntime-react-native.",
          detail: (err as Error).message,
        });
      }
    })();
  }, []);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <ThemedText style={styles.heading}>SAM probe</ThemedText>
          {!result && <ThemedText>Loading…</ThemedText>}
          {result && (
            <View
              style={styles.block}
              testID={result.ok ? "probe-ok" : "probe-fail"}
            >
              <ThemedText style={styles.status}>
                {result.ok ? "OK" : "FAIL"}
              </ThemedText>
              <ThemedText>{result.message}</ThemedText>
              {result.detail && (
                <ThemedText style={styles.detail}>{result.detail}</ThemedText>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: Spacing.xl, gap: Spacing.lg },
  heading: { fontSize: 24, fontWeight: "800" },
  block: { gap: Spacing.md },
  status: { fontSize: 32, fontWeight: "900" },
  detail: { fontSize: 12, opacity: 0.7 },
});

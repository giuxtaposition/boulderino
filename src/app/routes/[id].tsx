import { useMemo } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  BorderWidth,
  BottomTabHeight,
  MaxContentWidth,
  Radius,
  Spacing,
  Rainbow,
  Theme,
  blockShadow,
} from "@/constants/theme";
import { useContainer } from "@/composition/Container";
import { useTheme } from "@/hooks/use-theme";

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "long",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export default function RouteDetailScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { routeRepository, gradingSystemRegistry } = useContainer();

  const route = id ? routeRepository.findById(id) : undefined;

  if (!route) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.back()}
              testID="route-detail-back"
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.pressed,
              ]}
            >
              <ThemedText style={styles.backText}>← BACK</ThemedText>
            </Pressable>
            <View testID="route-detail-missing" style={styles.missingBlock}>
              <ThemedText style={styles.missingText}>
                Route not found.
              </ThemedText>
            </View>
          </ScrollView>
        </SafeAreaView>
      </ThemedView>
    );
  }

  let background: string = Rainbow[3];
  try {
    background = gradingSystemRegistry
      .requireByName(route.grade.systemId)
      .definitionFor(route.grade.name).color;
  } catch {
    background = Rainbow[3];
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            testID="route-detail-back"
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
          >
            <ThemedText style={styles.backText}>← BACK</ThemedText>
          </Pressable>

          <View
            testID="route-detail-card"
            style={[styles.card, { backgroundColor: background }]}
          >
            <Image
              source={{ uri: route.photo.url }}
              style={styles.photo}
              accessibilityLabel={`photo of route ${route.name}`}
              testID="route-detail-photo"
            />

            <ThemedText style={styles.name} testID="route-detail-name">
              {route.name}
            </ThemedText>

            <View style={styles.metaRow}>
              <View style={styles.gradeTag}>
                <ThemedText style={styles.gradeTagText}>
                  {route.grade.systemId} / {route.grade.name}
                </ThemedText>
              </View>
              <View style={styles.disciplineTag}>
                <ThemedText style={styles.disciplineTagText}>
                  {route.discipline}
                </ThemedText>
              </View>
            </View>

            <ThemedText style={styles.timestamp} testID="route-detail-created">
              {dateFormatter.format(route.createdAt)}
            </ThemedText>

            {route.tags.length > 0 && (
              <View style={styles.tagRow} testID="route-detail-tags">
                {route.tags.map((tag) => (
                  <View
                    key={tag}
                    style={styles.tagChip}
                    testID={`route-detail-tag-${tag}`}
                  >
                    <ThemedText style={styles.tagChipText}>#{tag}</ThemedText>
                  </View>
                ))}
              </View>
            )}

            {route.description ? (
              <View
                style={styles.descriptionBlock}
                testID="route-detail-description"
              >
                <ThemedText style={styles.descriptionLabel}>BETA</ThemedText>
                <ThemedText style={styles.descriptionText}>
                  {route.description}
                </ThemedText>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    scroll: {
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.four,
      paddingBottom: BottomTabHeight + Spacing.six,
      gap: Spacing.four,
      maxWidth: MaxContentWidth,
      width: "100%",
      alignSelf: "center",
    },
    backButton: {
      alignSelf: "flex-start",
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.three,
      borderWidth: BorderWidth.thick,
      borderColor: theme.border,
      backgroundColor: theme.inputBackground,
      borderRadius: Radius.small,
    },
    pressed: { transform: [{ translateX: 2 }, { translateY: 2 }] },
    backText: {
      color: theme.text,
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 1.5,
    },
    card: {
      borderWidth: BorderWidth.chunky,
      borderColor: theme.border,
      borderRadius: Radius.medium,
      padding: Spacing.four,
      gap: Spacing.three,
      ...blockShadow(theme),
    },
    photo: {
      width: "100%",
      aspectRatio: 4 / 3,
      borderRadius: Radius.small,
      borderWidth: BorderWidth.thick,
      borderColor: "#0F172A",
      backgroundColor: "#FFFFFF",
    },
    name: {
      fontSize: 28,
      fontWeight: "800",
      color: "#0F172A",
      letterSpacing: -0.5,
    },
    metaRow: {
      flexDirection: "row",
      gap: Spacing.two,
      flexWrap: "wrap",
    },
    gradeTag: {
      backgroundColor: "#FFFFFF",
      borderWidth: BorderWidth.thick,
      borderColor: "#0F172A",
      borderRadius: Radius.small,
      paddingVertical: Spacing.one,
      paddingHorizontal: Spacing.two,
    },
    gradeTagText: {
      color: "#0F172A",
      fontWeight: "800",
      fontSize: 13,
    },
    disciplineTag: {
      backgroundColor: "#0F172A",
      borderRadius: Radius.small,
      paddingVertical: Spacing.one,
      paddingHorizontal: Spacing.two,
    },
    disciplineTagText: {
      color: "#FFFFFF",
      fontWeight: "800",
      fontSize: 11,
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    timestamp: {
      fontSize: 12,
      fontWeight: "700",
      color: "#0F172A",
      opacity: 0.7,
    },
    tagRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: Spacing.two,
    },
    tagChip: {
      backgroundColor: "rgba(255,255,255,0.7)",
      borderWidth: BorderWidth.thick,
      borderColor: "#0F172A",
      borderRadius: Radius.pill,
      paddingVertical: Spacing.half,
      paddingHorizontal: Spacing.three,
    },
    tagChipText: {
      color: "#0F172A",
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 0.4,
    },
    descriptionBlock: {
      gap: Spacing.one,
      backgroundColor: "rgba(255,255,255,0.7)",
      borderWidth: BorderWidth.thick,
      borderColor: "#0F172A",
      borderRadius: Radius.small,
      padding: Spacing.three,
    },
    descriptionLabel: {
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1.5,
      color: "#0F172A",
      opacity: 0.7,
    },
    descriptionText: {
      fontSize: 15,
      fontWeight: "500",
      color: "#0F172A",
      lineHeight: 22,
    },
    missingBlock: {
      padding: Spacing.five,
      borderWidth: BorderWidth.thick,
      borderStyle: "dashed",
      borderColor: theme.borderMuted,
      borderRadius: Radius.medium,
      alignItems: "center",
    },
    missingText: { color: theme.textSecondary, fontWeight: "700" },
  });

import { Image, Pressable, StyleSheet, View } from "react-native";
import { Href, useRouter } from "expo-router";

import { ThemedText } from "../themed-text";
import {
  BorderWidth,
  Radius,
  Spacing,
  Theme,
  elevation,
  onColor,
} from "@/constants/theme";
import { Route } from "@/domain/route/Route";
import { useTheme } from "@/hooks/use-theme";
import { DisciplineTag } from "../molecules/DisciplineTag";

type RouteCardProps = {
  route: Route;
  index: number;
  background: string;
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const formatDate = (date: Date): string => dateFormatter.format(date);

export function RouteCard({ route, index, background }: RouteCardProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const router = useRouter();
  const cardTextColor = onColor(background);

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`Open ${route.name}`}
      testID={`route-row-${index}`}
      onPress={() => router.push(`/routes/${route.id.value}` as Href)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: background, borderColor: cardTextColor },
        pressed && styles.pressed,
      ]}
    >
      <Image
        source={{ uri: route.photo.url }}
        style={[styles.photo, { borderColor: cardTextColor }]}
        accessibilityLabel={`photo of route ${route.name}`}
        testID={`route-photo-${index}`}
      />
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <ThemedText
            style={[styles.name, { color: cardTextColor }]}
            numberOfLines={1}
          >
            {route.name}
          </ThemedText>
          <DisciplineTag discipline={route.discipline} />
        </View>
        <View style={styles.headerRow}>
          <ThemedText style={[styles.grade, { color: cardTextColor }]}>
            {route.grade.systemId} / {route.grade.name}
          </ThemedText>
        </View>
        <ThemedText
          style={[styles.timestamp, { color: cardTextColor, opacity: 0.7 }]}
          testID={`route-created-${index}`}
        >
          {formatDate(route.createdAt)}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      gap: Spacing.lg,
      borderWidth: BorderWidth.thick,
      borderRadius: Radius.md,
      padding: Spacing.lg,
      ...elevation(theme, "md"),
    },
    pressed: { transform: [{ translateX: 3 }, { translateY: 3 }] },
    photo: {
      width: 88,
      height: 88,
      borderRadius: Radius.sm,
      borderWidth: BorderWidth.thick,
      backgroundColor: theme.surface1,
    },
    body: { flex: 1, gap: Spacing.md, justifyContent: "space-between" },
    name: {
      fontSize: 17,
      fontWeight: "800",
      letterSpacing: -0.3,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: Spacing.md,
    },
    grade: {
      fontSize: 14,
      fontWeight: "800",
      flexShrink: 1,
    },
    timestamp: {
      fontSize: 11,
      fontWeight: "700",
    },
  });

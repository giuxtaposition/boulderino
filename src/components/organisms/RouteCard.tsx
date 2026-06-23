import { Image, Pressable, StyleSheet, View } from "react-native";
import { Href, useRouter } from "expo-router";

import { ThemedText } from "../themed-text";
import {
  BorderWidth,
  PressableState,
  Radius,
  Spacing,
  Theme,
  blockShadow,
  focusRing,
  onColor,
} from "@/constants/theme";
import { Route } from "@/domain/route/Route";
import { useTheme } from "@/hooks/use-theme";

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
  const tagBackground = theme.text;
  const tagTextColor = onColor(tagBackground);

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`Open ${route.name}`}
      testID={`route-row-${index}`}
      onPress={() => router.push(`/routes/${route.id.value}` as Href)}
      style={({ pressed, focused }: PressableState) => [
        styles.card,
        { backgroundColor: background },
        pressed && styles.pressed,
        focused && styles.focused,
      ]}
    >
      <Image
        source={{ uri: route.photo.url }}
        style={[styles.photo, { borderColor: theme.border }]}
        accessibilityLabel={`photo of route ${route.name}`}
        testID={`route-photo-${index}`}
      />
      <View style={styles.body}>
        <ThemedText
          style={[styles.name, { color: cardTextColor }]}
          numberOfLines={1}
        >
          {route.name}
        </ThemedText>
        <View style={styles.headerRow}>
          <ThemedText style={[styles.grade, { color: cardTextColor }]}>
            {route.grade.systemId} / {route.grade.name}
          </ThemedText>
          <View style={[styles.tag, { backgroundColor: tagBackground }]}>
            <ThemedText style={[styles.tagText, { color: tagTextColor }]}>
              {route.discipline}
            </ThemedText>
          </View>
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
      gap: Spacing.three,
      borderWidth: BorderWidth.chunky,
      borderColor: theme.border,
      borderRadius: Radius.medium,
      padding: Spacing.three,
      ...blockShadow(theme),
    },
    pressed: { transform: [{ translateX: 3 }, { translateY: 3 }] },
    focused: focusRing(theme),
    photo: {
      width: 88,
      height: 88,
      borderRadius: Radius.small,
      borderWidth: BorderWidth.thick,
      backgroundColor: theme.backgroundElement,
    },
    body: { flex: 1, gap: Spacing.one, justifyContent: "space-between" },
    name: {
      fontSize: 17,
      fontWeight: "800",
      letterSpacing: -0.3,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: Spacing.two,
    },
    grade: {
      fontSize: 14,
      fontWeight: "800",
      flexShrink: 1,
    },
    tag: {
      paddingVertical: Spacing.half,
      paddingHorizontal: Spacing.two,
      borderRadius: Radius.small,
    },
    tagText: {
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    timestamp: {
      fontSize: 11,
      fontWeight: "700",
    },
  });

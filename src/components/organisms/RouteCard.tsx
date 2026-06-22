import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Href, useRouter } from 'expo-router';

import { ThemedText } from '../themed-text';
import {
  BorderWidth,
  Radius,
  Spacing,
  Theme,
  blockShadow,
} from '@/constants/theme';
import { Route } from '@/domain/route/Route';
import { useTheme } from '@/hooks/use-theme';

type RouteCardProps = {
  route: Route;
  index: number;
  background: string;
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

const formatDate = (date: Date): string => dateFormatter.format(date);

export function RouteCard({ route, index, background }: RouteCardProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const router = useRouter();

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`Open ${route.name}`}
      testID={`route-row-${index}`}
      onPress={() => router.push(`/routes/${route.id.value}` as Href)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: background },
        pressed && styles.pressed,
      ]}>
      <Image
        source={{ uri: route.photo.url }}
        style={styles.photo}
        accessibilityLabel={`photo of route ${route.name}`}
        testID={`route-photo-${index}`}
      />
      <View style={styles.body}>
        <ThemedText style={styles.name} numberOfLines={1}>
          {route.name}
        </ThemedText>
        <View style={styles.headerRow}>
          <ThemedText style={styles.grade}>
            {route.grade.systemId} / {route.grade.value}
          </ThemedText>
          <View style={styles.tag}>
            <ThemedText style={styles.tagText}>{route.discipline}</ThemedText>
          </View>
        </View>
        <ThemedText style={styles.timestamp} testID={`route-created-${index}`}>
          {formatDate(route.createdAt)}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      gap: Spacing.three,
      borderWidth: BorderWidth.chunky,
      borderColor: theme.border,
      borderRadius: Radius.medium,
      padding: Spacing.three,
      ...blockShadow(theme),
    },
    pressed: { transform: [{ translateX: 3 }, { translateY: 3 }] },
    photo: {
      width: 88,
      height: 88,
      borderRadius: Radius.small,
      borderWidth: BorderWidth.thick,
      borderColor: '#0F172A',
      backgroundColor: '#FFFFFF',
    },
    body: { flex: 1, gap: Spacing.one, justifyContent: 'space-between' },
    name: {
      fontSize: 17,
      fontWeight: '800',
      color: '#0F172A',
      letterSpacing: -0.3,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: Spacing.two,
    },
    grade: {
      fontSize: 14,
      fontWeight: '800',
      color: '#0F172A',
      flexShrink: 1,
    },
    tag: {
      backgroundColor: '#0F172A',
      paddingVertical: Spacing.half,
      paddingHorizontal: Spacing.two,
      borderRadius: Radius.small,
    },
    tagText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    timestamp: {
      fontSize: 11,
      fontWeight: '700',
      color: '#0F172A',
      opacity: 0.7,
    },
  });

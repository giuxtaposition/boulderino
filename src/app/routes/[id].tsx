import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import { Button } from "@/components/atoms/Button";
import {
  AttemptForm,
  AttemptFormInput,
} from "@/components/organisms/AttemptForm";
import { AttemptList } from "@/components/organisms/AttemptList";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Attempt } from "@/domain/route/Attempt";
import { Hold } from "@/domain/route/Hold";

const HoldEditor = lazy(() => import("@/components/organisms/HoldEditor"));
const HoldOverlay = lazy(() => import("@/components/organisms/HoldOverlay"));
import {
  BottomTabHeight,
  MaxContentWidth,
  Radius,
  Spacing,
  Theme,
  elevation,
  pickRainbowColor,
  RainbowTokens,
  BorderWidth,
  onColor,
  outcomeColor,
} from "@/constants/theme";
import { useContainer } from "@/composition/Container";
import { useTheme } from "@/hooks/use-theme";
import { DisciplineTag } from "../../components/molecules/DisciplineTag";
import { Tag } from "../../components/atoms/Tag";

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
  const {
    routeRepository,
    gradingSystemRegistry,
    updateRouteHolds,
    logAttempt,
    deleteRoute,
    deleteAttempt,
  } = useContainer();

  const [route, setRoute] = useState(() =>
    id ? routeRepository.findById(id) : undefined,
  );
  const [editing, setEditing] = useState(false);
  const [draftHolds, setDraftHolds] = useState<readonly Hold[]>(
    route?.holds ?? [],
  );
  const [attempts, setAttempts] = useState<readonly Attempt[]>(
    route?.attempts ?? [],
  );
  const [loggingAttempt, setLoggingAttempt] = useState(false);
  const [markingFall, setMarkingFall] = useState(false);
  const [fallHolds, setFallHolds] = useState<readonly Hold[]>([]);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleStartEdit = useCallback(() => {
    if (!route) return;
    setDraftHolds(route.holds);
    setEditing(true);
  }, [route]);

  const handleCancelEdit = useCallback(() => {
    setEditing(false);
    setDraftHolds(route?.holds ?? []);
  }, [route]);

  const handleSaveEdit = useCallback(() => {
    if (!route) return;
    const updated = updateRouteHolds.execute({
      routeId: route.id.value,
      holds: draftHolds,
    });
    setRoute(updated);
    setDraftHolds(updated.holds);
    setEditing(false);
  }, [route, draftHolds, updateRouteHolds]);

  const handleDelete = useCallback(() => {
    if (!route) return;
    deleteRoute.execute({ routeId: route.id.value });
    router.replace("/routes");
  }, [route, deleteRoute, router]);

  const handleLogAttempt = useCallback(
    (input: AttemptFormInput) => {
      if (!route) return;
      const attempt = logAttempt.execute({
        routeId: route.id.value,
        outcome: input.outcome,
        notes: input.notes,
        fallHolds: input.fallHolds,
        date: input.date,
      });
      setAttempts((current) => [...current, attempt]);
      setLoggingAttempt(false);
    },
    [route, logAttempt],
  );

  const handleDeleteAttempt = useCallback(
    (attemptId: string) => {
      if (!route) return;
      deleteAttempt.execute({ routeId: route.id.value, attemptId });
      setAttempts((current) =>
        current.filter((attempt) => attempt.id !== attemptId),
      );
    },
    [route, deleteAttempt],
  );

  if (!route) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.canGoBack() ? router.back() : router.replace("/routes")
              }
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

  if (editing) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
          <View style={styles.editorFullscreen}>
            <Suspense fallback={<ActivityIndicator />}>
              <HoldEditor
                photoUri={route.photo.url}
                photoWidth={route.photo.width}
                photoHeight={route.photo.height}
                holds={draftHolds}
                onChange={setDraftHolds}
                testID="route-detail-hold-editor"
              />
            </Suspense>
            <View style={styles.editorToolbar}>
              <Button onPress={handleSaveEdit} testID="route-detail-save-holds">
                SAVE HOLDS
              </Button>
              <Button
                onPress={handleCancelEdit}
                testID="route-detail-cancel-edit"
                variant="outline"
              >
                CANCEL
              </Button>
            </View>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (markingFall) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
          <View style={styles.editorFullscreen}>
            <Suspense fallback={<ActivityIndicator />}>
              <HoldEditor
                photoUri={route.photo.url}
                photoWidth={route.photo.width}
                photoHeight={route.photo.height}
                holds={fallHolds}
                onChange={setFallHolds}
                color={outcomeColor(theme, "fell")}
                testID="attempt-form-hold-editor"
              />
            </Suspense>
            <View style={styles.editorToolbar}>
              <Button
                onPress={() => setMarkingFall(false)}
                testID="attempt-form-done-fall"
              >
                SAVE FALL HOLDS
              </Button>
              <Button
                onPress={() => {
                  setFallHolds([]);
                  setMarkingFall(false);
                }}
                testID="attempt-form-clear-fall"
                style={styles.cancelButton}
              >
                CLEAR
              </Button>
            </View>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  let background = RainbowTokens.green.bg;
  try {
    background = gradingSystemRegistry
      .requireByName(route.grade.systemId)
      .definitionFor(route.grade.name).color;
  } catch {
    background = RainbowTokens.green.bg;
  }
  const onCard = onColor(background);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/routes")
            }
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
            style={[
              styles.card,
              { backgroundColor: background, borderColor: onCard },
            ]}
          >
            <Suspense
              fallback={
                <View
                  style={[
                    styles.photoFrame,
                    {
                      aspectRatio:
                        route.photo.width > 0 && route.photo.height > 0
                          ? route.photo.width / route.photo.height
                          : 4 / 3,
                    },
                  ]}
                >
                  <ActivityIndicator />
                </View>
              }
            >
              {editing ? (
                <HoldEditor
                  photoUri={route.photo.url}
                  photoWidth={route.photo.width}
                  photoHeight={route.photo.height}
                  holds={draftHolds}
                  onChange={setDraftHolds}
                  testID="route-detail-hold-editor"
                />
              ) : (
                <HoldOverlay
                  photoUri={route.photo.url}
                  photoWidth={route.photo.width}
                  photoHeight={route.photo.height}
                  holds={route.holds}
                  accessibilityLabel={`photo of route ${route.name}`}
                  testID="route-detail-photo"
                  style={styles.photoFrame}
                />
              )}
            </Suspense>

            <View style={styles.editRow}>
              {editing ? (
                <>
                  <Button
                    onPress={handleSaveEdit}
                    testID="route-detail-save-holds"
                  >
                    SAVE HOLDS
                  </Button>
                  <Button
                    onPress={handleCancelEdit}
                    testID="route-detail-cancel-edit"
                    variant="outline"
                  >
                    CANCEL
                  </Button>
                </>
              ) : confirmingDelete ? (
                <>
                  <Button
                    action="negative"
                    onPress={handleDelete}
                    testID="route-detail-confirm-delete"
                  >
                    CONFIRM DELETE
                  </Button>
                  <Button
                    onPress={() => setConfirmingDelete(false)}
                    testID="route-detail-cancel-delete"
                    variant="outline"
                  >
                    CANCEL
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onPress={handleStartEdit}
                    testID="route-detail-edit-holds"
                  >
                    EDIT HOLDS
                  </Button>
                  <Button
                    action="negative"
                    onPress={() => setConfirmingDelete(true)}
                    testID="route-detail-delete"
                  >
                    DELETE ROUTE
                  </Button>
                </>
              )}
            </View>

            <ThemedText
              style={[styles.name, { color: onCard }]}
              testID="route-detail-name"
            >
              {route.name}
            </ThemedText>

            <View style={styles.metaRow}>
              <Tag
                color={theme.surface3}
                testID="route-detail-grade-tag"
                leftIcon={
                  <View
                    style={[
                      styles.gradeSwatch,
                      { backgroundColor: background },
                    ]}
                    testID="route-detail-grade-swatch"
                  />
                }
              >
                {route.grade.name}
              </Tag>
              <DisciplineTag discipline={route.discipline} />
            </View>

            <ThemedText
              style={[styles.timestamp, { color: onCard }]}
              testID="route-detail-created"
            >
              {dateFormatter.format(route.createdAt)}
            </ThemedText>

            {route.tags.length > 0 && (
              <View style={styles.tagRow} testID="route-detail-tags">
                {route.tags.map((tag, index) => (
                  <Tag
                    key={tag}
                    color={pickRainbowColor(index)}
                    border={true}
                    testID={`route-detail-tag-${tag}`}
                  >
                    #{tag}
                  </Tag>
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

            <View style={styles.attemptsBlock} testID="route-detail-attempts">
              <View style={styles.attemptsHeader}>
                <ThemedText
                  style={[styles.descriptionLabel, { color: onCard }]}
                >
                  ATTEMPTS
                </ThemedText>
                {!loggingAttempt && (
                  <Button
                    size="small"
                    onPress={() => setLoggingAttempt(true)}
                    testID="route-detail-log-attempt"
                  >
                    LOG ATTEMPT
                  </Button>
                )}
              </View>

              {loggingAttempt ? (
                <AttemptForm
                  fallHolds={fallHolds}
                  onSubmit={handleLogAttempt}
                  onCancel={() => setLoggingAttempt(false)}
                  onMarkFall={() => setMarkingFall(true)}
                  testID="route-detail-attempt-form"
                />
              ) : (
                <AttemptList
                  attempts={attempts}
                  photoUri={route.photo.url}
                  photoWidth={route.photo.width}
                  photoHeight={route.photo.height}
                  onDelete={handleDeleteAttempt}
                  testID="route-detail-attempt-list"
                />
              )}
            </View>
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
    editorFullscreen: {
      flex: 1,
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.xl,
      gap: Spacing.lg,
    },
    editorToolbar: {
      flexDirection: "row",
      gap: Spacing.md,
      paddingBottom: BottomTabHeight + Spacing.md,
    },
    cancelButton: {
      opacity: 0.7,
    },
    scroll: {
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.xl,
      paddingBottom: BottomTabHeight + Spacing.xxxl,
      gap: Spacing.xl,
      maxWidth: MaxContentWidth,
      width: "100%",
      alignSelf: "center",
    },
    backButton: {
      alignSelf: "flex-start",
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      borderWidth: BorderWidth.thick,
      borderColor: theme.border,
      backgroundColor: theme.surface1,
      borderRadius: Radius.sm,
    },
    pressed: { transform: [{ translateX: 2 }, { translateY: 2 }] },
    backText: {
      color: theme.text,
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 1.5,
    },
    card: {
      borderWidth: BorderWidth.thick,
      borderColor: theme.border,
      borderRadius: Radius.md,
      padding: Spacing.xl,
      gap: Spacing.lg,
      ...elevation(theme, "md"),
    },
    photoFrame: {
      width: "100%",
      borderRadius: Radius.sm,
      borderWidth: BorderWidth.thick,
      borderColor: theme.border,
      backgroundColor: theme.surface1,
      overflow: "hidden",
    },
    editRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: Spacing.md,
    },
    name: {
      fontSize: 28,
      fontWeight: "800",
      color: theme.text,
      letterSpacing: -0.5,
    },
    metaRow: {
      flexDirection: "row",
      gap: Spacing.md,
      flexWrap: "wrap",
    },
    gradeSwatch: {
      width: 10,
      height: 10,
      borderRadius: Radius.sm,
      borderWidth: BorderWidth.thin,
      borderColor: theme.border,
    },
    timestamp: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.text,
      opacity: 0.7,
    },
    tagRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: Spacing.md,
    },
    descriptionBlock: {
      gap: Spacing.md,
      backgroundColor: theme.surface3,
      borderWidth: BorderWidth.thick,
      borderColor: theme.border,
      borderRadius: Radius.sm,
      padding: Spacing.lg,
    },
    descriptionLabel: {
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1.5,
      color: theme.text,
      opacity: 0.7,
    },
    descriptionText: {
      fontSize: 15,
      fontWeight: "500",
      color: theme.text,
      lineHeight: 22,
    },
    attemptsBlock: {
      gap: Spacing.lg,
    },
    attemptsHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: Spacing.md,
    },
    missingBlock: {
      padding: Spacing.xxl,
      borderWidth: BorderWidth.thick,
      borderStyle: "dashed",
      borderColor: theme.borderMuted,
      borderRadius: Radius.md,
      alignItems: "center",
    },
    missingText: { color: theme.textSecondary, fontWeight: "700" },
  });

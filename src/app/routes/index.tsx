import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import { Button } from "@/components/atoms/Button";
import { EmptyBlock } from "@/components/atoms/EmptyBlock";
import { ErrorBlock } from "@/components/atoms/ErrorBlock";
import { FormCardDrawer } from "@/components/atoms/FormCardDrawer";
import { Input } from "@/components/atoms/Input";
import { DisciplineSelector } from "@/components/molecules/DisciplineSelector";
import { FormField } from "@/components/molecules/FormField";
import { GradePicker } from "@/components/organisms/GradePicker";
import { GradingSystemPicker } from "@/components/organisms/GradingSystemPicker";
import { PhotoPicker, PickedPhoto } from "@/components/organisms/PhotoPicker";
import { RouteCard } from "@/components/organisms/RouteCard";

const HoldEditor = lazy(() => import("@/components/organisms/HoldEditor"));
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
} from "@/constants/theme";
import { useContainer } from "@/composition/Container";
import { Discipline } from "@/domain/route/Discipline";
import { GradingSystem } from "@/domain/grading/GradingSystem";
import { Hold } from "@/domain/route/Hold";
import { Route } from "@/domain/route/Route";
import { useTheme } from "@/hooks/use-theme";
import { Fab } from "../../components/atoms/Fab";

export default function RoutesScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { addRoute, routeRepository, gradingSystemRegistry } = useContainer();

  const [systems, setSystems] = useState<GradingSystem[]>(() =>
    gradingSystemRegistry.findAll(),
  );
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [discipline, setDiscipline] = useState<Discipline>("bouldering");
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [photo, setPhoto] = useState<PickedPhoto | null>(null);
  const [holds, setHolds] = useState<readonly Hold[]>([]);
  const [routes, setRoutes] = useState<Route[]>(() =>
    routeRepository.findAll(),
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setSystems(gradingSystemRegistry.findAll());
    }, [gradingSystemRegistry]),
  );

  const activeSystem = useMemo(
    () => systems.find((system) => system.name === selectedSystem) ?? null,
    [systems, selectedSystem],
  );

  const handleSelectSystem = (systemName: string) => {
    setSelectedSystem(systemName);
    setSelectedGrade(null);
    setError(null);
  };

  const handlePickPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
      if (result.canceled || result.assets.length === 0) return;
      const asset = result.assets[0];
      setPhoto({
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
      });
      setHolds([]);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) return setError("Name your route");
    if (!selectedSystem) return setError("Select a grading system");
    if (!selectedGrade) return setError("Select a grade");
    if (!photo) return setError("Pick a photo from your gallery");

    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    try {
      addRoute.execute({
        name,
        description: description.trim() || null,
        tags,
        discipline,
        gradingSystemName: selectedSystem,
        gradeValue: selectedGrade,
        photo: { url: photo.uri, width: photo.width, height: photo.height },
        holds,
      });
      setRoutes(routeRepository.findAll());
      setName("");
      setDescription("");
      setTagsInput("");
      setSelectedGrade(null);
      setPhoto(null);
      setHolds([]);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <ThemedText style={styles.kicker}>ROUTES · LEVEL 02</ThemedText>
            <ThemedText style={styles.heading}>Routes</ThemedText>
          </View>

          <View testID="list-routes" style={styles.list}>
            {routes.length === 0 ? (
              <EmptyBlock message="No routes. Add your first route." />
            ) : (
              routes.map((route, index) => {
                let background: string = Rainbow[3];
                try {
                  background = gradingSystemRegistry
                    .requireByName(route.grade.systemId)
                    .definitionFor(route.grade.name).color;
                } catch {
                  background = Rainbow[3];
                }
                return (
                  <RouteCard
                    key={route.id.value}
                    route={route}
                    index={index}
                    background={background}
                  />
                );
              })
            )}
          </View>

          <FormCardDrawer
            visible={showAddForm}
            setVisible={setShowAddForm}
            title="Add new route"
            testID="form-route"
          >
            <FormField label="Name">
              <Input
                value={name}
                onChangeText={setName}
                placeholder="e.g. Mantle Mayhem"
                accessibilityLabel="route name"
                autoCapitalize="words"
                autoCorrect={false}
                testID="input-route-name"
              />
            </FormField>

            <FormField label="Description">
              <Input
                value={description}
                onChangeText={setDescription}
                placeholder="Beta, holds, vibes…"
                accessibilityLabel="route description"
                multiline
                numberOfLines={3}
                testID="input-route-description"
                style={styles.multiline}
              />
            </FormField>

            <FormField label="Tags">
              <Input
                value={tagsInput}
                onChangeText={setTagsInput}
                placeholder="overhang, slab, crimps"
                accessibilityLabel="route tags"
                autoCapitalize="none"
                autoCorrect={false}
                testID="input-route-tags"
              />
            </FormField>

            <FormField label="Discipline">
              <DisciplineSelector value={discipline} onChange={setDiscipline} />
            </FormField>

            <FormField label="Grading system">
              {systems.length === 0 ? (
                <View style={styles.hint} testID="no-systems-hint">
                  <ThemedText style={styles.hintText}>
                    No grading systems yet. Add one in the Grades tab.
                  </ThemedText>
                </View>
              ) : (
                <GradingSystemPicker
                  systems={systems}
                  selected={selectedSystem}
                  onSelect={handleSelectSystem}
                />
              )}
            </FormField>

            {activeSystem && (
              <FormField label="Grade">
                <GradePicker
                  grades={activeSystem.grades}
                  selected={selectedGrade}
                  onSelect={setSelectedGrade}
                />
              </FormField>
            )}

            <FormField label="Photo">
              <PhotoPicker photo={photo} onPick={handlePickPhoto} />
            </FormField>

            {photo && (
              <FormField label="Holds">
                <Suspense fallback={<ActivityIndicator />}>
                  <HoldEditor
                    photoUri={photo.uri}
                    photoWidth={photo.width}
                    photoHeight={photo.height}
                    holds={holds}
                    onChange={setHolds}
                    testID="form-hold-editor"
                  />
                </Suspense>
              </FormField>
            )}

            <Button
              onPress={handleSubmit}
              testID="submit-route"
              style={styles.submit}
            >
              ADD NEW ROUTE
            </Button>

            {error && <ErrorBlock testID="error-route" message={error} />}
          </FormCardDrawer>
        </ScrollView>

        <Fab onPress={() => setShowAddForm(true)} />
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
      gap: Spacing.five,
      maxWidth: MaxContentWidth,
      width: "100%",
      alignSelf: "center",
    },
    header: { gap: Spacing.one },
    kicker: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 2,
      color: theme.textSecondary,
    },
    heading: {
      fontSize: 30,
      fontWeight: "800",
      letterSpacing: -0.5,
      color: theme.text,
    },
    submit: { marginTop: Spacing.three },
    multiline: {
      minHeight: 84,
      paddingTop: Spacing.three,
      textAlignVertical: "top",
    },
    hint: {
      borderWidth: BorderWidth.thick,
      borderStyle: "dashed",
      borderColor: theme.borderMuted,
      borderRadius: Radius.small,
      padding: Spacing.three,
    },
    hintText: { color: theme.textSecondary, fontWeight: "600" },
    list: { gap: Spacing.three },
  });

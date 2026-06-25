import { ReactNode, useMemo } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  ViewProps,
  useWindowDimensions,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import {
  BorderWidth,
  MaxContentWidth,
  Radius,
  Spacing,
  Theme,
  elevation,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { X } from "lucide-react-native";
import { IconButton } from "./IconButton";
import { ThemedText } from "../themed-text";

const MobileBreakpoint = 600;
const DesktopOffset = 160;

type FormCardProps = ViewProps & {
  title: string;
  children: ReactNode;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  fullscreen?: boolean;
};

export function FormCardDrawer({
  style,
  children,
  visible,
  setVisible,
  title,
  fullscreen = false,
  ...rest
}: FormCardProps) {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const isMobile = width < MobileBreakpoint;
  const desktopMaxHeight = Math.max(240, height - DesktopOffset);
  const styles = useMemo(
    () => makeStyles(theme, isMobile, desktopMaxHeight),
    [theme, isMobile, desktopMaxHeight],
  );

  const header = (
    <View style={styles.header}>
      <ThemedText style={styles.title}>{title}</ThemedText>
      <IconButton onPress={() => setVisible(false)}>
        <X color={theme.text} size={20} />
      </IconButton>
    </View>
  );

  if (isMobile) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={() => setVisible(false)}
      >
        <GestureHandlerRootView style={styles.sheetRoot}>
          <Pressable
            style={styles.backdrop}
            onPress={() => setVisible(false)}
            accessibilityLabel="close drawer"
          />
          <View
            {...rest}
            style={[styles.card, fullscreen && styles.cardFullscreen, style]}
          >
            {header}
            {fullscreen ? (
              children
            ) : (
              <ScrollView
                contentContainerStyle={styles.sheetContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {children}
              </ScrollView>
            )}
          </View>
        </GestureHandlerRootView>
      </Modal>
    );
  }

  if (!visible) return null;

  return (
    <View
      {...rest}
      style={[styles.card, fullscreen && styles.cardFullscreen, style]}
    >
      {header}
      {fullscreen ? (
        children
      ) : (
        <ScrollView
          contentContainerStyle={styles.sheetContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      )}
    </View>
  );
}

const makeStyles = (
  theme: Theme,
  isMobile: boolean,
  desktopMaxHeight: number,
) =>
  StyleSheet.create({
    card: isMobile
      ? {
          backgroundColor: theme.surface1,
          borderTopWidth: BorderWidth.thick,
          borderLeftWidth: BorderWidth.thick,
          borderRightWidth: BorderWidth.thick,
          borderColor: theme.border,
          borderTopLeftRadius: Radius.lg,
          borderTopRightRadius: Radius.lg,
          paddingHorizontal: Spacing.xl,
          paddingTop: Spacing.xl,
          paddingBottom: Spacing.md,
          gap: Spacing.md,
          maxHeight: "85%",
        }
      : {
          backgroundColor: theme.surface1,
          borderWidth: BorderWidth.thick,
          borderColor: theme.border,
          borderRadius: Radius.md,
          paddingHorizontal: Spacing.xl,
          paddingTop: Spacing.xl,
          paddingBottom: Spacing.md,
          gap: Spacing.md,
          position: "fixed",
          bottom: 80,
          left: Spacing.xl,
          right: Spacing.xl,
          marginHorizontal: "auto",
          width: "100%",
          maxWidth: MaxContentWidth,
          maxHeight: desktopMaxHeight,
          ...elevation(theme, "md"),
        },
    sheetRoot: {
      flex: 1,
      justifyContent: "flex-end",
    },
    backdrop: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    sheetContent: {
      paddingBottom: Spacing.xxl,
      gap: Spacing.md,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
    },
    cardFullscreen: {
      top: Spacing.xl,
      maxHeight: "100%",
      flex: 1,
    },
  });

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
  Media,
  Radius,
  Spacing,
  Theme,
  blockShadow,
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
          <View {...rest} style={[styles.card, fullscreen && styles.cardFullscreen, style]}>
            {header}
            {fullscreen ? (
              <View style={styles.fullscreenContent}>{children}</View>
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
    <View {...rest} style={[styles.card, fullscreen && styles.cardFullscreen, style]}>
      {header}
      {fullscreen ? (
        <View style={styles.fullscreenContent}>{children}</View>
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

const makeStyles = (theme: Theme, isMobile: boolean, desktopMaxHeight: number) =>
  StyleSheet.create({
    card: isMobile
      ? {
          backgroundColor: theme.backgroundElement,
          borderTopWidth: BorderWidth.chunky,
          borderLeftWidth: BorderWidth.chunky,
          borderRightWidth: BorderWidth.chunky,
          borderColor: theme.border,
          borderTopLeftRadius: Radius.large,
          borderTopRightRadius: Radius.large,
          paddingHorizontal: Spacing.four,
          paddingTop: Spacing.four,
          paddingBottom: Spacing.two,
          gap: Spacing.two,
          maxHeight: "85%",
        }
      : {
          backgroundColor: theme.backgroundElement,
          borderWidth: BorderWidth.chunky,
          borderColor: theme.border,
          borderRadius: Radius.medium,
          paddingHorizontal: Spacing.four,
          paddingTop: Spacing.four,
          paddingBottom: Spacing.two,
          gap: Spacing.two,
          position: "fixed",
          bottom: 80,
          left: Spacing.four,
          right: Spacing.four,
          marginHorizontal: "auto",
          width: "100%",
          maxWidth: MaxContentWidth,
          maxHeight: desktopMaxHeight,
          ...blockShadow(theme),
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
      backgroundColor: Media.scrim,
    },
    sheetContent: {
      paddingBottom: Spacing.six,
      gap: Spacing.two,
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
      top: Spacing.four,
      maxHeight: "100%",
      flex: 1,
    },
    fullscreenContent: {
      flex: 1,
      overflow: "hidden",
    },
  });

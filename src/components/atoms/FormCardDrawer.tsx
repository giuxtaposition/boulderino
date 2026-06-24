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

import {
  BorderWidth,
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

type FormCardProps = ViewProps & {
  title: string;
  children: ReactNode;
  visible: boolean;
  setVisible: (visible: boolean) => void;
};

export function FormCardDrawer({
  style,
  children,
  visible,
  setVisible,
  title,
  ...rest
}: FormCardProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < MobileBreakpoint;
  const styles = useMemo(
    () => makeStyles(theme, isMobile),
    [theme, isMobile],
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
        <View style={styles.sheetRoot}>
          <Pressable
            style={styles.backdrop}
            onPress={() => setVisible(false)}
            accessibilityLabel="close drawer"
          />
          <View {...rest} style={[styles.card, style]}>
            {header}
            <ScrollView
              contentContainerStyle={styles.sheetContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <View
      {...rest}
      style={[styles.card, visible === false && { display: "none" }, style]}
    >
      {header}
      {children}
    </View>
  );
}

const makeStyles = (theme: Theme, isMobile: boolean) =>
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
          padding: Spacing.four,
          gap: Spacing.two,
          position: "fixed",
          overflowX: "hidden",
          overflowY: "scroll",
          bottom: 80,
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
  });

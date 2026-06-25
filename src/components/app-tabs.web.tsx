import { useMemo } from "react";
import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from "expo-router/ui";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "./themed-text";
import {
  BorderWidth,
  BottomTabHeight,
  MaxContentWidth,
  Radius,
  Spacing,
  Theme,
  elevation,
  RainbowTokens,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: "100%" }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="grading-systems" href="/grading-systems" asChild>
            <TabButton
              backgroundColor={RainbowTokens.yellow.bg}
              color={RainbowTokens.yellow.on}
            >
              Grades
            </TabButton>
          </TabTrigger>
          <TabTrigger name="routes" href="/routes" asChild>
            <TabButton
              backgroundColor={RainbowTokens.cyan.bg}
              color={RainbowTokens.cyan.on}
            >
              Routes
            </TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

type TabButtonProps = TabTriggerSlotProps & {
  color: string;
  backgroundColor: string;
};

export function TabButton({
  children,
  isFocused,
  color,
  backgroundColor,
  ...props
}: TabButtonProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <Pressable
      {...props}
      style={({ pressed }) => [
        styles.tabButton,
        isFocused && { backgroundColor: backgroundColor },
        pressed && styles.tabPressed,
      ]}
    >
      <ThemedText style={[styles.tabLabel, isFocused && { color: color }]}>
        {children}
      </ThemedText>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View {...props} style={styles.tabListContainer}>
      <View style={styles.tabsRow}>{props.children}</View>
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    tabListContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.xl,
      paddingBottom: Spacing.lg,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      backgroundColor: theme.tabBar,
      borderTopWidth: BorderWidth.thick,
      borderTopColor: theme.border,
      zIndex: 100,
    },
    tabsRow: {
      flexDirection: "row",
      gap: Spacing.md,
      width: "100%",
      maxWidth: MaxContentWidth,
      height: BottomTabHeight - 28,
    },
    tabButton: {
      flex: 1,
      paddingHorizontal: Spacing.lg,
      borderRadius: Radius.sm,
      borderWidth: BorderWidth.thick,
      borderColor: theme.border,
      backgroundColor: theme.tabBarInactive,
      justifyContent: "center",
      alignItems: "center",
      minHeight: 44,
      ...elevation(theme, "sm"),
    },
    tabPressed: {
      transform: [{ translateX: 2 }, { translateY: 2 }],
    },
    tabLabel: {
      color: theme.text,
      fontSize: 14,
      fontWeight: "800",
      letterSpacing: 1,
    },
  });

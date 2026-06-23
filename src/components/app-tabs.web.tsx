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
  Rainbow,
  Theme,
  blockShadow,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export default function AppTabs() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <Tabs>
      <TabSlot style={{ height: "100%" }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="grading-systems" href="/grading-systems" asChild>
            <TabButton color={Rainbow[1]}>Grades</TabButton>
          </TabTrigger>
          <TabTrigger name="routes" href="/routes" asChild>
            <TabButton color={Rainbow[3]}>Routes</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

type TabButtonProps = TabTriggerSlotProps & { color: string };

export function TabButton({
  children,
  isFocused,
  color,
  ...props
}: TabButtonProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <Pressable
      {...props}
      style={({ pressed }) => [
        styles.tabButton,
        isFocused && { backgroundColor: color },
        pressed && styles.tabPressed,
      ]}
    >
      <ThemedText style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
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
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.two,
      paddingBottom: Spacing.three,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      backgroundColor: theme.tabBar,
      borderTopWidth: BorderWidth.chunky,
      borderTopColor: theme.border,
      zIndex: 100,
    },
    tabsRow: {
      flexDirection: "row",
      gap: Spacing.two,
      width: "100%",
      maxWidth: MaxContentWidth,
      height: BottomTabHeight - 28,
    },
    tabButton: {
      flex: 1,
      paddingHorizontal: Spacing.three,
      borderRadius: Radius.small,
      borderWidth: BorderWidth.thick,
      borderColor: theme.border,
      backgroundColor: theme.tabBarInactive,
      justifyContent: "center",
      alignItems: "center",
      minHeight: 44,
      ...blockShadow(theme, 3),
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
    tabLabelActive: {
      color: "#0F172A",
    },
  });

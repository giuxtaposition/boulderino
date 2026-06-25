import { PressableProps } from "react-native";
import { IconButton } from "../atoms/IconButton";
import { Trash } from "lucide-react-native";
import { RainbowTokens } from "../../constants/theme";

type DeleteIconButtonProps = Omit<PressableProps, "children">;

export function DeleteIconButton({ testID, ...rest }: DeleteIconButtonProps) {
  return (
    <IconButton
      border={true}
      testID={testID ?? "delete-icon-button"}
      backgroundColor={RainbowTokens.red.bg}
      accessibilityLabel="Delete"
      {...rest}
    >
      <Trash color={RainbowTokens.red.on} size={16} />
    </IconButton>
  );
}

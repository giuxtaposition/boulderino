import { PressableProps } from "react-native";
import { IconButton } from "../atoms/IconButton";
import { Pencil } from "lucide-react-native";
import { RainbowTokens } from "../../constants/theme";

type EditIconButtonProps = Omit<PressableProps, "children">;

export function EditIconButton({ testID, ...rest }: EditIconButtonProps) {
  return (
    <IconButton
      border={true}
      testID={testID ?? "edit-icon-button"}
      backgroundColor={RainbowTokens.yellow.bg}
      accessibilityLabel="Edit"
      {...rest}
    >
      <Pencil color={RainbowTokens.yellow.on} size={16} />
    </IconButton>
  );
}

import { useTheme } from "@/hooks/use-theme";
import { Tag } from "../atoms/Tag";
import { DISCIPLINES_OPTIONS } from "./DisciplineSelector";
import { Discipline } from "../../domain/route/Discipline";

type DisciplineTagProps = {
  discipline: Discipline;
};

export function DisciplineTag({ discipline }: DisciplineTagProps) {
  const theme = useTheme();
  const tagBackground =
    DISCIPLINES_OPTIONS.find((option) => option.value === discipline)?.color ??
    theme.background;

  return (
    <Tag border={true} color={tagBackground}>
      {discipline}
    </Tag>
  );
}

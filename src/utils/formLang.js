import { useTranslateStore } from "@/stores/translate";

export const formTranslater = (rawLabel) => {
  const t = useTranslateStore();
  if (!rawLabel || typeof rawLabel !== "string") return rawLabel;
  const parts = rawLabel.split(";");
  let found = parts.find((p) => p.startsWith(t.locale + ":"));
  if (!found) {
    found = parts.find((p) => p.startsWith("kh:"));
  }
  return found ? found.replace(/^.*?:/, "").trim() : rawLabel;
};

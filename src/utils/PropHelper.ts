import { Platform } from "react-native";
import { Some } from "./Some";

export const setTestProps =
  ({ prefix } = { prefix: "" }) =>
  ({
    name,
  }: {
    readonly name: string | undefined;
  }): { readonly testID: string; readonly accessibilityLabel: string } | {} =>
    Some<string>(name)
      ? {
          ...Platform.select({
            android: {
              accessibilityLabel: prefix + name,
              testID: prefix + name,
            },
            ios: {
              testID: prefix + name,
            },
          }),
        }
      : {};

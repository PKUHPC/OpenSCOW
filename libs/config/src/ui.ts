import { GetConfigFn, getConfigFromFile } from "@scow/lib-config";
import { Static, Type } from "@sinclair/typebox";
import { DEFAULT_CONFIG_BASE_PATH } from "src/constants";

export const DEFAULT_PRIMARY_COLOR = "#9B0000";

export const UiConfigSchema = Type.Object({
  footer: Type.Optional(Type.Object({
    defaultText: Type.Optional(Type.String({ description: "默认的footer文本" })),
    hostnameTextMap: Type.Optional(Type.Record(Type.String(), Type.String(),
      { description: "根据域名（hostname，不包括port）不同，显示在footer上的文本" })),
  })),

  primaryColor: Type.Optional(Type.Object({
    defaultColor: Type.String({ description: "默认主题色", default: DEFAULT_PRIMARY_COLOR }),
    hostnameMap: Type.Optional(Type.Record(Type.String(), Type.String(),
      { description: "根据域名（hostname，不包括port）不同，应用的主题色" })),
  })),
});

const UI_CONFIG_NAME = "ui";

export type UiConfigSchema = Static<typeof UiConfigSchema>;

export const getUiConfig: GetConfigFn<UiConfigSchema> = (baseConfigPath) =>
  getConfigFromFile(UiConfigSchema, UI_CONFIG_NAME, baseConfigPath ?? DEFAULT_CONFIG_BASE_PATH);

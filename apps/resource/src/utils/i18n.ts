import { I18nDicType, languageDic } from "src/models/i18n";

export const getLanguage = (languageId: string | undefined | null): I18nDicType => {
  const languages = ((languageId && languageId in languageDic)
    ? languageDic[languageId as keyof typeof languageDic]
    : undefined
  ) ?? languageDic.zh_cn;
  return languages;
};

export type I18nDicKeys = keyof I18nDicType;

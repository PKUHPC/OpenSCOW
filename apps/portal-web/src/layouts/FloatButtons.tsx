/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { AppFloatButtons } from "@scow/lib-web/build/layouts/AppFloatButtons";
import moon from "@scow/lib-web/icons/moon.svg";
import sun from "@scow/lib-web/icons/sun.svg";
import sunMoon from "@scow/lib-web/icons/sun-moon.svg";
import { useI18n } from "src/i18n";
import { publicConfig } from "src/utils/config";

interface FloatButtonProps {
  languageId: string;
}

export const FloatButtons: React.FC<FloatButtonProps> = ({ languageId }) => {

  const currentLangId = languageId ? languageId : useI18n().currentLanguage.id;
  return (
    <AppFloatButtons darkModeButtonProps={{
      dark: moon, light: sun, system: sunMoon,
      languageId: currentLangId,
      basePath: publicConfig.BASE_PATH,
    }}
    />
  );
};

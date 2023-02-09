/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * SCOW is licensed under Mulan PSL v2.
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
import { publicConfig } from "src/utils/config";

export const FloatButtons = () => {
  return (
    <AppFloatButtons darkModeButtonProps={{
      dark: moon, light: sun, system: sunMoon,
      basePath: publicConfig.BASE_PATH,
    }}
    />
  );
};

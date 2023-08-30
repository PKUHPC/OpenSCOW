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

import { Lang } from "react-typed-i18n";
import { useI18n } from "src/i18n";
import en from "src/i18n/en";

function useI18nTranslate() {
  const i18n = useI18n();

  const t = (id: Lang<typeof en>, args: React.ReactNode[] = []): string | React.ReactNode => {
    return i18n.translate(id, args);
  };

  return {
    t,
  };
}

export default useI18nTranslate;

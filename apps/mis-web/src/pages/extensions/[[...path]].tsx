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

import { ExtensionPage as LibExtensionPage } from "@scow/lib-web/build/extensions/ExtensionPage";
import { UiExtensionStore } from "@scow/lib-web/build/extensions/UiExtensionStore";
import { Spin } from "antd";
import { NextPage } from "next";
import { useStore } from "simstate";
import { api } from "src/apis";
import { NotFoundPage } from "src/components/errorPages/NotFoundPage";
import { useI18n } from "src/i18n";
import { UserStore } from "src/stores/UserStore";

export const ExtensionPage: NextPage = () => {
  const userStore = useStore(UserStore);

  const uiExtensionStore = useStore(UiExtensionStore);

  const i18n = useI18n();

  if (uiExtensionStore.isLoading) {
    return (
      <Spin />
    );
  }

  if (!uiExtensionStore.data) {
    return (
      <NotFoundPage />
    );
  }

  console.log("我在MIS的LibExtensionPage读取了userStore.user",userStore.user);
  console.log("我在MIS的userStore.user.token",userStore.user?.token);

  return (
    <LibExtensionPage
      uiExtensionStoreConfig={uiExtensionStore.data}
      user={userStore.user}
      currentLanguageId={i18n.currentLanguage.id}
      NotFoundPageComponent={NotFoundPage}
      validateToken={api.validateToken}
    />
  );

};

export default ExtensionPage;

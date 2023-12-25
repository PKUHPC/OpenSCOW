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

import { joinWithUrl } from "@scow/utils";
import { useRouter } from "next/router";
import React from "react";
import { UiExtensionStore } from "src/extensions/UiExtensionStore";
import { UserInfo } from "src/layouts/base/types";
import { useDarkMode } from "src/layouts/darkMode";
import { queryToArray } from "src/utils/querystring";
import { styled } from "styled-components";

const FrameContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;

const IFrame = styled.iframe`
  display: flex;
  border: none;
  flex: 1;
`;

interface Props {
  user: UserInfo | undefined;

  uiExtensionStoreConfig: NonNullable<ReturnType<typeof UiExtensionStore>["config"]>;

  currentLanguageId: string;
}

export const ExtensionPage: React.FC<Props> = ({ user, uiExtensionStoreConfig, currentLanguageId }) => {


  const router = useRouter();

  const { path, ...rest } = router.query;

  const pathParts = queryToArray(router.query.path);

  const darkMode = useDarkMode();

  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(rest).filter(([_, val]) => typeof val === "string")) as Record<string, string>,
  );

  if (user) {
    query.set("scowUserToken", user.token);
  }

  query.set("scowDark", darkMode.dark ? "true" : "false");

  query.set("scowLangId", currentLanguageId);

  const url = joinWithUrl(uiExtensionStoreConfig.url, "extensions", ...pathParts)
    + "?" + query.toString();

  return (
    <FrameContainer>
      <IFrame
        src={url}
      />
    </FrameContainer>
  );

};


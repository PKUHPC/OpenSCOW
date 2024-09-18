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

import { Result } from "antd";
import React from "react";
import { useI18nTranslate, useI18nTranslateToString } from "src/i18n";
import { Head } from "src/utils/head";



interface Props {
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
}

export const ForbiddenPage: React.FC<Props> = () => {

  const tArgs = useI18nTranslate();
  const t = useI18nTranslateToString();

  const titleText = tArgs("component.errorPages.notAllowedPage");
  const subTitleText = tArgs("component.errorPages.systemNotAllowed");

  return (
    <>
      <Head title={t("component.errorPages.notAllowed")} />
      <Result
        status="403"
        title={titleText}
        subTitle={subTitleText}
      />
    </>
  );
};

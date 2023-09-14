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

import { Result } from "antd";
import { NextPage } from "next";
import { useI18nTranslateToString } from "src/i18n";

export const NoAccountPage: NextPage = () => {

  const { t } = useI18nTranslateToString();

  return (
    <Result
      status="warning"
      title={t("page.noAccount.resultTitle")}
      subTitle=""
      extra={(
        <p>
          请访问 http://hpc.pku.edu.cn/guide.html 查看如何开户。
        </p>
      )}
    />
  );
};

export default NoAccountPage;

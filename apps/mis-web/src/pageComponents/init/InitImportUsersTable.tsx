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

import { Alert, Typography } from "antd";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { styled } from "styled-components";

import { ImportUsersTable } from "../admin/ImportUsersTable";


const AlertContainer = styled.div`
  margin-bottom: 16px;
`;

const p = prefix("pageComp.init.initImportUsersTable.");

export const InitImportUsersTable: React.FC = () => {

  const t = useI18nTranslateToString();

  return (
    <div>
      <Typography.Paragraph>{t(p("importUser"))}
        <a target="_blank" href="https://pkuhpc.github.io/OpenSCOW/docs/mis/business/users" rel="noreferrer">
          {t(p("document"))}
        </a>
        {t(p("learn"))}
      </Typography.Paragraph>
      <AlertContainer>
        <Alert
          type="warning"
          showIcon
          message={t(p("useMore"))}
        />
      </AlertContainer>
      <ImportUsersTable />
    </div>
  );
};


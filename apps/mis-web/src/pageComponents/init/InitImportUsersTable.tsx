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

import { FormLayout } from "@scow/lib-web/build/layouts/FormLayout";
import { Alert, Typography } from "antd";
import { Centered } from "src/components/layouts";
import styled from "styled-components";

import { ImportUsersTable } from "../admin/ImportUsersTable";


const AlertContainer = styled.div`
  margin-bottom: 16px;
`;


export const InitImportUsersTable: React.FC = () => {

  return (
    <Centered>
      <FormLayout maxWidth={800}>
        <Typography.Paragraph>您可以在此导入已有用户。 查看
          <a target="_blank" href="https://pkuhpc.github.io/SCOW/docs/mis/business/users" rel="noreferrer">
          此文档
          </a>
          了解系统用户模型以及如何导入用户信息。
        </Typography.Paragraph>
        <AlertContainer>
          <Alert
            type="warning"
            showIcon
            message="如果您使用SCOW管理多个集群，SCOW系统要求多个集群具有完全相同的用户账户信息，您只需要从一个集群中导入已有用户信息即可。"
          />
        </AlertContainer>
        <ImportUsersTable />
      </FormLayout>
    </Centered>
  );
};


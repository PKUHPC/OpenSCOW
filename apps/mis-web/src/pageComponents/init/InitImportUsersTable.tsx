import { Alert } from "antd";
import { Centered } from "src/components/layouts";
import { FormLayout } from "src/layouts/FormLayout";
import styled from "styled-components";

import { ImportUsersTable } from "../admin/ImportUsersTable";


const AlertContainer = styled.div`
  margin-bottom: 16px;
`;


export const InitImportUsersTable: React.FC = () => {

  return (
    <Centered>
      <FormLayout maxWidth={800}>
        <p>您可以在此导入已有用户。 查看
          <a target="_blank" href="https://pkuhpc.github.io/SCOW/docs/mis/business/users" rel="noreferrer">
          此文档
          </a>
          了解系统用户模型以及如何导入用户信息。
        </p>
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


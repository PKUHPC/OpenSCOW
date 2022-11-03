import { Centered } from "src/components/layouts";
import { FormLayout } from "src/layouts/FormLayout";

import { ImportUsersTable } from "../admin/ImportUsersTable";


export const InitImportUsersTable: React.FC = () => {

  return (
    <Centered>
      <FormLayout maxWidth={800}>
        <p>您可以在导入已有用户。 查看
          <a target="_blank" href="https://pkuhpc.github.io/SCOW/docs/mis/business/users" rel="noreferrer">
          此文档
          </a>
          了解系统用户模型以及如何导入用户信息。
        </p>
        <ImportUsersTable />
      </FormLayout>
    </Centered>
  );
};


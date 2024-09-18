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
import { GetServerSideProps, NextPage } from "next";
import { SSRProps } from "src/auth/server";
import { UnifiedErrorPage } from "src/components/errorPages/UnifiedErrorPage";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { InitDrawer } from "src/pageComponents/init/InitLayout";
import { InitUsersAndAccountsTable } from "src/pageComponents/init/InitUsersAndAccountsTable";
import { queryIfInitialized } from "src/utils/init";

type Props = SSRProps<{}>;

const p = prefix("page.init.");

export const UsersPage: NextPage<Props> = (props) => {
  const t = useI18nTranslateToString();

  if ("error" in props) {
    return (
      <UnifiedErrorPage
        code={props.error}
        customComponents={{
          409: (
            <Result
              status="error"
              title={t(p("systemInitialized"))}
              subTitle={t(p("unableReinitialize"))}
            />
          ),
        }}
      />
    );
  }
  return (
    <div>
      <InitDrawer>
        <InitUsersAndAccountsTable />
      </InitDrawer>
    </div>
  );

};

export const getServerSideProps: GetServerSideProps<Props> = async () => {

  const result = await queryIfInitialized();

  if (result) { return { props: { error: 409 } }; }

  return { props: {} };

};


export default UsersPage;

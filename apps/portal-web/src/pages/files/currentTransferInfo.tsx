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

import { NextPage } from "next";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { Redirect } from "src/components/Redirect";
import { TransferInfoTable } from "src/pageComponents/filemanager/TransferInfoTable";
import { publicConfig } from "src/utils/config";

export const FileTransferPage: NextPage = requireAuth(() => true)(() => {
  if (!publicConfig.CROSS_CLUSTER_FILE_TRANSFER_ENABLED) {
    return <Redirect url={"/dashboard"} />;
  }

  return (
    <div>
      <PageTitle titleText={"文件传输进度查看"} />
      <TransferInfoTable />
    </div>
  );

});

export default FileTransferPage;
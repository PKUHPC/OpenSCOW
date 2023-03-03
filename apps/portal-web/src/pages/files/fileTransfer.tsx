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
import { ClusterFileTable } from "src/pageComponents/filemanager/ClusterFileTable";
import { publicConfig } from "src/utils/config";

export const FileTransferPage: NextPage = requireAuth(() => true)(() => {
  const cluster = "hpc01";
  const clusterObj = publicConfig.CLUSTERS.find((x) => x.id === cluster);
  const homePath = "/data/home/demo_user";
  return (
    <div>
      <ClusterFileTable
        cluster={clusterObj!}
        homePath={ homePath }
      />
    </div>
  );
});

export default FileTransferPage;

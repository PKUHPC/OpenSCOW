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

import { Col, Row } from "antd";
import { NextPage } from "next";
import { requireAuth } from "src/auth/requireAuth";
import { ClusterFileTable } from "src/pageComponents/filemanager/ClusterFileTable";
import { publicConfig } from "src/utils/config";

export const FileTransferPage: NextPage = requireAuth(() => true)(() => {
  const cluster1 = "hpc01";
  const clusterObj1 = publicConfig.CLUSTERS.find((x) => x.id === cluster1);
  const homePath1 = "/data/home/demo_user";

  const cluster2 = "hpc02";
  const clusterObj2 = publicConfig.CLUSTERS.find((x) => x.id === cluster2);
  const homePath2 = "/data/home/demo_user";

  return (
    <>
      <Row>
        <Col span={12}>
          <ClusterFileTable
            cluster={clusterObj1!}
            homePath={ homePath1 }
          />
        </Col>
        <Col span={12}>
          <ClusterFileTable
            cluster={clusterObj2!}
            homePath={ homePath2 }
          />
        </Col>
      </Row>
    </>
  );
});

export default FileTransferPage;

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

import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { Button, Col, Row } from "antd";
import { NextPage } from "next";
import { requireAuth } from "src/auth/requireAuth";
import { ClusterFileTable } from "src/pageComponents/filemanager/ClusterFileTable";

export const FileTransferPage: NextPage = requireAuth(() => true)(() => {

  return (
    <>
      <Row justify="space-around" align="middle">
        <Col span={11}>
          <ClusterFileTable />
        </Col>
        <Col span={0.5}>
          <Row justify="center">
            <Button icon={<ArrowRightOutlined />} />
          </Row>
          <Row justify="center">
            <Button icon={<ArrowLeftOutlined />} />
          </Row>
        </Col>
        <Col span={11}>
          <ClusterFileTable />
        </Col>
      </Row>
    </>
  );
});

export default FileTransferPage;

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

"use client";

import { PictureOutlined } from "@ant-design/icons";
import { Avatar, Card, Col, Result, Row, Tooltip } from "antd";
import Link from "next/link";
import { join } from "path";
import { useState } from "react";
import { AppSchema } from "src/server/trpc/route/jobs/apps";
import { styled } from "styled-components";


const CardContainer = styled.div`
  flex: 1;
  display: flex;
  flex-wrap: wrap;
`;

const AvatarContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const NameContainer = styled.div`
  text-align: center;
  margin-top: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;


interface Props {
  publicPath: string
  clusterId: string
  apps: AppSchema[],
  isTraining?: boolean,
}

type ImageErrorMap = Record<string, boolean>;


export const SelectAppTable: React.FC<Props> = ({ publicPath, clusterId, apps, isTraining = false }) => {

  const [imageErrorMap, setImageErrorMap] = useState<ImageErrorMap>({});

  const handleImageError = (appId: string) => {
    setImageErrorMap((prevMap) => ({ ...prevMap, [appId]: true }));
  };

  if (Object.keys(apps || {}).length === 0) {
    return (
      <Result
        status="404"
        title={"404"}
        subTitle={"not found"}
      />
    );
  }

  return (
    <CardContainer>
      <Row gutter={16} style={{ flex: 1, width: "100%" }}>
        {apps.map((app) => (
          <Col xs={24} sm={12} md={8} lg={6} xl={4} xxl={4} key={app.id} style={{ marginBottom: "16px" }}>
            <Card bodyStyle={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <Tooltip title={`创建${app.name}`} placement="bottom">
                <Link href={`/jobs/${clusterId}/${isTraining ? "trainJobs" : "createApps"}/${app.id}`}>
                  <AvatarContainer>
                    {
                      (app.logoPath && imageErrorMap[app.id] !== true) ? (
                        <img
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            objectFit: "contain",
                            width: "150px",
                            height: "150px",
                          }}
                          src={join(publicPath, app.logoPath)}
                          onError={() => handleImageError(app.id)}
                        />
                      ) : (
                        <Avatar
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "0",
                          }}
                          size={150}
                          icon={<PictureOutlined />}
                        />
                      )
                    }
                  </AvatarContainer>
                  <NameContainer>{app.name}</NameContainer>
                </Link>
              </Tooltip>
            </Card>
          </Col>
        ))}
      </Row>
    </CardContainer>

  );
};

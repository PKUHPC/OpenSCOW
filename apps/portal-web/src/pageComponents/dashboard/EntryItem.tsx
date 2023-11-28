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

import { PictureOutlined } from "@ant-design/icons";
import { Avatar } from "antd";
import { join } from "path";
import React, { CSSProperties, useState } from "react";
import Icon from "src/components/Icon";
import { publicConfig } from "src/utils/config";
import { styled } from "styled-components"; ;

const ItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
`;

const AvatarContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const NameContainer = styled.div`
  text-align: center;
  white-space: nowrap;
  margin-top: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  user-select: none;
`;

interface Props {
  name: string,
  icon?: string,
  logoPath?: string;
  style?: CSSProperties
}

interface ImageErrorMap {
  [appId: string]: boolean;
}

export const EntryItem: React.FC<Props> = ({ name, icon, logoPath, style }) => {

  const [imageErrorMap, setImageErrorMap] = useState<ImageErrorMap>({});

  const handleImageError = (appId: string) => {
    setImageErrorMap((prevMap) => ({ ...prevMap, [appId]: true }));
  };

  return (
    <ItemContainer style={style}>
      <AvatarContainer>
        {
          (logoPath && imageErrorMap[name] !== true) ? (
            <img
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                objectFit: "contain",
                width: "80px",
                height: "80px",
              }}
              src={join(publicConfig.PUBLIC_PATH, logoPath)}
              onError={() => handleImageError(name)}
            />
          ) : (
            <Avatar
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "0",
                ...icon ? { backgroundColor:"#fff" } : {},
              }}
              size={80}
              icon={icon ? <Icon name={icon} style={{ fontSize:"60px", color:"#666" }} /> : <PictureOutlined />}
            />
          )
        }
      </AvatarContainer>
      <NameContainer>{name}</NameContainer>
    </ItemContainer>
  );
};

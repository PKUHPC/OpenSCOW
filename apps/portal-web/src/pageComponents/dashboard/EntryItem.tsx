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
import { join } from "path";
import React, { CSSProperties, useState } from "react";
import { ColoredIcon, isSupportedIconName } from "src/components/Icon";
import { publicConfig } from "src/utils/config";
import { styled } from "styled-components"; ;

const ItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  height: 100%;
  width: 100%;
  position: relative;
`;

const AvatarContainer = styled.div`
  display: flex;
  justify-content: center;
  flex: 1;
`;

const NameContainer = styled.div`
  text-align: center;
  white-space: nowrap;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  user-select: none;
`;

interface Props {
  entryBaseName: string;
  entryExtraInfo?: string[];
  icon?: string,
  logoPath?: string;
  style?: CSSProperties
}

interface ImageErrorMap {
  [appId: string]: boolean;
}

export const EntryItem: React.FC<Props> = ({ style,
  entryBaseName, entryExtraInfo, icon, logoPath }) => {

  const [imageErrorMap, setImageErrorMap] = useState<ImageErrorMap>({});

  const handleImageError = (appId: string) => {
    setImageErrorMap((prevMap) => ({ ...prevMap, [appId]: true }));
  };

  return (
    <ItemContainer style={style}>
      <AvatarContainer>
        {
          (logoPath && imageErrorMap[entryBaseName] !== true) ? (
            <img
              src={join(publicConfig.PUBLIC_PATH, logoPath)}
              onError={() => handleImageError(entryBaseName)}
              style={{ maxWidth:"100px", objectFit:"contain" }}
            />
          ) : (
            icon && isSupportedIconName(icon) ?
              <ColoredIcon name={icon} style={{ fontSize:"60px" }} />
              : <PictureOutlined style={{ fontSize:"52px" }} />
          )}
      </AvatarContainer>
      {
        [entryBaseName, ...entryExtraInfo ?? []].map((x, i) => (
          <NameContainer key={i}>{x}</NameContainer>
        ))
      }
    </ItemContainer>
  );
};

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

import { Divider } from "antd";
import styled from "styled-components";

const FooterContainer = styled.div`
  display: flex;
  justify-content: center;

  margin-bottom: 8px;
  // https://v1.tailwindcss.com/docs/text-color text-gray-500
  color: #a0aec0;
`;

interface Props {
  text: string;
  versionTag: string | undefined;
}

export const Footer: React.FC<Props> = ({ text, versionTag }) => {

  const versionTagLink = versionTag
    ? `https://github.com/PKUHPC/SCOW/releases/tag/${versionTag}`
    : "";

  return (
    <>
      <FooterContainer>
        <span>Powered by&nbsp;
          <a href="https://github.com/PKUHPC/SCOW" target="_blank">
            SCOW
          </a>
          &nbsp;
          <a href={versionTagLink}>{versionTag || ""}</a>
        </span>
      </FooterContainer>
      <Divider style={{ marginTop: 0, marginBottom: 10 }} />
      <FooterContainer
        dangerouslySetInnerHTML={{ __html: text }} />
    </>
  );
};


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

import { Typography } from "antd";
import { join } from "path";
import { antdBreakpoints } from "src/layouts/base/constants";
import { UserInfo } from "src/layouts/base/types";
import styled from "styled-components";

export const HeaderItem = styled.div`
  padding: 0 16px;
  /* justify-content: center; */
  height: 100%;

  @media (max-width: ${antdBreakpoints.md}px) {
    padding-right: 4px;
  }

`;

export const HiddenOnSmallScreenSpan = styled.span`
  @media (max-width: ${antdBreakpoints.md}px) {
    display: none;
  }
`;

interface JumpToAnotherLinkProps {
  user: UserInfo | undefined;
  icon: React.ReactNode;
  link: string | undefined;
  linkText: string;
}

export const JumpToAnotherLink: React.FC<JumpToAnotherLinkProps> = ({ user, link, icon, linkText }) => {
  if (!link) { return null; }

  return (

    <HeaderItem>
      {/* Cannot use Link because links adds BASE_PATH, but MIS_URL already contains it */}
      <Typography.Link href={user
        ? join(link, "/api/auth/callback?token=" + user.token)
        : link}
      >
        {icon}
        <HiddenOnSmallScreenSpan>
          {linkText}
        </HiddenOnSmallScreenSpan>
      </Typography.Link>
    </HeaderItem>

  );
};

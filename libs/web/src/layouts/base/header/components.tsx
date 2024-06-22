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
import { useRef } from "react";
import { antdBreakpoints } from "src/layouts/base/constants";
import { styled } from "styled-components";

export const HeaderItem = styled.div`
  padding: 0 16px;
  justify-content: center;

  @media (max-width: ${antdBreakpoints.md}px) {
    padding-right: 4px;
  }

`;

const LinkItem = styled(HeaderItem)`
`;

const Link = styled(Typography.Link)`
  display: flex;
  flex-wrap: wrap;
  overflow: hidden;
  align-items: center;

`;

export const TextSpan = styled.span`
  @media (max-width: ${antdBreakpoints.md}px) {
    display: none;
  }
`;

export const IconContainer = styled.span`
  display: flex;
  align-items: center;
`;

interface JumpToAnotherLinkProps {
  icon: React.ReactNode;
  href: string;
  text: string;
  hideText?: boolean;
}

export const JumpToAnotherLink: React.FC<JumpToAnotherLinkProps> = ({ href, icon, text, hideText }) => {

  const linkRef = useRef<HTMLAnchorElement>(null);

  return (

    <LinkItem>
      {/* Cannot use Link because links adds BASE_PATH, but MIS_URL already contains it */}
      <Link href={href} ref={linkRef}>
        <IconContainer>
          {icon}
        </IconContainer>
        {hideText ? undefined : (
          <TextSpan>
            {text}
          </TextSpan>
        )}
      </Link>
    </LinkItem>

  );
};

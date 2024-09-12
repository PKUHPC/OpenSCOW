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

import { Button, ButtonProps } from "antd";
import { PropsWithChildren } from "react";
import styled from "styled-components";

const StyleNoShadowButton = styled(Button)`
  box-shadow: none !important;
`;

export const NoShadowButton: React.FC<PropsWithChildren<ButtonProps>> = ({ children, ...rest }) => {
  return (
    <StyleNoShadowButton {...rest}>
      {children}
    </StyleNoShadowButton>
  );
};

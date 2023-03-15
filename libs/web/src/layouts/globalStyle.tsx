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

import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  #nprogress .bar {
    background-color: ${({ theme }) => theme.token.colorPrimary};
  }

 // HACK
  a {
    color: ${({ theme }) => theme.token.colorPrimaryText};
  }

 // 对日期组件在手机端展示做样式兼容处理(起)
  .ant-picker-dropdown {
    max-width: 100%;
  }

  .ant-picker-dropdown .ant-picker-panel-layout {
    overflow-y: scroll;
  }
 // 对日期组件在手机端展示做样式兼容处理(止)
`;


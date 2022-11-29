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

export const antdBreakpoints = {
  xxs: 0,
  xs: 480,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
};

export type Breakpoint = keyof typeof antdBreakpoints;

export const layoutConstants = {
  paddingBreakpoint: "md" as Breakpoint,
  menuBreakpoint: "md" as Breakpoint,
  headerHeight: 56,
  sidebarBreakpoint: "lg" as Breakpoint,
  headerIconColor: "#ffffff",
  headerIconBackgroundColor: "#1890FF",
  headerBackgrounColor: "#001529",
  maxWidth: 1200,
};

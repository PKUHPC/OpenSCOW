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

export declare const antdBreakpoints: {
    xxs: number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
};
export type Breakpoint = keyof typeof antdBreakpoints;
export declare const layoutConstants: {
    paddingBreakpoint: "md" | "xxs" | "xs" | "sm" | "lg" | "xl" | "xxl";
    menuBreakpoint: "md" | "xxs" | "xs" | "sm" | "lg" | "xl" | "xxl";
    headerHeight: number;
    sidebarBreakpoint: "md" | "xxs" | "xs" | "sm" | "lg" | "xl" | "xxl";
    headerIconColor: string;
    headerIconBackgroundColor: string;
    headerBackgrounColor: string;
    maxWidth: number;
};

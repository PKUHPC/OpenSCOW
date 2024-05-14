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

import Icon from "@ant-design/icons";
import React, { LegacyRef } from "react";

// 仪表盘图标
const dashBoardSVG = () => (
  <svg width="14" height="14" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="14" cy="14" r="13" stroke="#262743" strokeWidth="2" />
    <circle cx="14" cy="14" r="2.25" stroke="#262743" strokeWidth="1.5" />
    <path
      d="M6 14C6 12.9494 6.20693 11.9091 6.60896 10.9385
    C7.011 9.96793 7.60028 9.08601 8.34315 8.34314C9.08602 7.60028 9.96793 7.011 10.9385 6.60896
    C11.9091 6.20692 12.9494 6 14 6
    C15.0506 6 16.0909 6.20693 17.0615 6.60896
    M21.391 10.9385C21.7931 11.9091 22 12.9494 22 14"
      stroke="#262743"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path d="M16 12L20 8" stroke="#262743" strokeWidth="1.5" strokeLinecap="round" />
  </svg>

);


export const DashBoardIcon: React.ForwardRefExoticComponent<{}> = React.forwardRef((props,
  ref: LegacyRef<HTMLSpanElement> | undefined) => (
  <Icon component={dashBoardSVG} {...props} ref={ref} />
));

// 作业图标
const jobSVG = () => (
  <svg width="14" height="14" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M2 1H22C22.5523 1 23 1.44771 23 2
    V4.44706V16.3059V26
    C23 26.5523 22.5523 27 22 27
    H2C1.44772 27 1 26.5523 1 26
    V2C1 1.44772 1.44772 1 2 1Z"
      stroke="#262743"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path d="M6 10H18" stroke="#262743" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M6 14H15" stroke="#262743" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M6 18H13" stroke="#262743" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const JobIcon: React.ForwardRefExoticComponent<{}> = React.forwardRef((props,
  ref: LegacyRef<HTMLSpanElement> | undefined) => (
  <Icon component={jobSVG} {...props} ref={ref} />
));

// shell图标
const shellSVG = () => (
  <svg width="14" height="14" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="26" height="26" rx="1" stroke="#262743" strokeWidth="2" />
    <line x1="6.55671e-08" y1="10.25" x2="28" y2="10.25" stroke="#262743" strokeWidth="1.5" />
    <circle cx="5" cy="6" r="1" fill="#262743" />
    <circle cx="9" cy="6" r="1" fill="#262743" />
    <circle cx="13" cy="6" r="1" fill="#262743" />
    <path
      d="M7 15.6001L11.2 18.9251
    L7 22.2501"
      stroke="#262743"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M14 21.2002H20.3" stroke="#262743" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const ShellIcon: React.ForwardRefExoticComponent<{}> = React.forwardRef((props,
  ref: LegacyRef<HTMLSpanElement> | undefined) => (
  <Icon component={shellSVG} {...props} ref={ref} />
));

// 桌面图标
const desktopSVG = () => (
  <svg width="14" height="14" viewBox="0 0 30 29" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M7 7H3C1.89543 7 1 7.89543 1 9
    V26C1 27.1046 1.89543 28 3 28
    H27C28.1046 28 29 27.1046 29 26
    V9C29 7.89543 28.1046 7 27 7H23"
      stroke="#262743"
      strokeWidth="2"
    />
    <path
      d="M8 1H22C22.5523 1 23 1.44771 23 2
    V3.65294V13.3941V21C23 21.5523 22.5523 22 22 22
    H8C7.44772 22 7 21.5523 7 21V2C7 1.44772 7.44772 1 8 1Z"
      stroke="#262743"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path d="M10.5 9H19.5" stroke="#262743" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M10.5 12H17.25" stroke="#262743" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M10.5 15H15.75" stroke="#262743" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const DesktopIcon: React.ForwardRefExoticComponent<{}> = React.forwardRef((props,
  ref: LegacyRef<HTMLSpanElement> | undefined) => (
  <Icon component={desktopSVG} {...props} ref={ref} />
));

// 交互式应用图标
const applicationSVG = () => (
  <svg width="14" height="14" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M26.4292 14.0916C26.4292 16.3292 25.7918 18.5214 24.5902 20.4165
    C23.3887 22.3116 21.6717 23.8326 19.6365 24.805"
      stroke="#262743"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M14.4161 1.18918C12.0487 1.18918 9.73399 1.88183 7.7628 3.18015
    C5.79161 4.47846 4.25177 6.32455 3.33667 8.48657"
      stroke="#262743"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <rect x="1" y="13.902" width="13.2475" height="13.0981" rx="1" stroke="#262743" strokeWidth="2" />
    <rect x="18.585" y="0.75" width="8.66503" height="8.56538" rx="1.25" stroke="#262743" strokeWidth="1.5" />
  </svg>
);

export const ApplicationIcon: React.ForwardRefExoticComponent<{}> = React.forwardRef((props,
  ref: LegacyRef<HTMLSpanElement> | undefined) => (
  <Icon component={applicationSVG} {...props} ref={ref} />
));

// 文件管理图标
const fileManagerSVG = () => (
  <svg width="14" height="14" viewBox="0 0 26 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M23 15V5.44706V3C23 1.89543 22.1046 1 21 1
    H3C1.89543 1 1 1.89543 1 3V27C1 28.1046 1.89543 29 3 29H12"
      stroke="#262743"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M22.4615 28H15.7692L13 23.1648L15.7692 18
    H22.4615L25 23.1648L22.4615 28Z"
      stroke="#262743"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <circle cx="2" cy="2" r="2" transform="matrix(1 0 0 -1 17 25)" fill="#262743" />
  </svg>
);

export const FileManagerIcon: React.ForwardRefExoticComponent<{}> = React.forwardRef((props,
  ref: LegacyRef<HTMLSpanElement> | undefined) => (
  <Icon component={fileManagerSVG} {...props} ref={ref} />
));

// 管理mis图标
const misSVG = () => (
  <svg width="14" height="14" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M2 0.75H26.5706C26.9458 0.75 27.25 1.05418 27.25 1.42941V5.24118V7
C27.25 7.69036 26.6904 8.25 26 8.25H2C1.30964 8.25 0.75 7.69036 0.75 7
V2C0.75 1.30964 1.30964 0.75 2 0.75Z"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <ellipse cx="6.25" cy="4.50004" rx="1.25" ry="1.32353" />
    <ellipse cx="10.25" cy="4.50004" rx="1.25" ry="1.32353" />
    <ellipse cx="14.25" cy="4.50004" rx="1.25" ry="1.32353" />
    <path
      d="M2 10.25H26.5706C26.9458 10.25 27.25 10.5542 27.25 10.9294
V14.7412V16.5C27.25 17.1904 26.6904 17.75 26 17.75H2C1.30964 17.75 0.75 17.1904 0.75 16.5V11.5
C0.75 10.8096 1.30964 10.25 2 10.25Z"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <ellipse cx="6.25" cy="14" rx="1.25" ry="1.32353" />
    <ellipse cx="10.25" cy="14" rx="1.25" ry="1.32353" />
    <ellipse cx="14.25" cy="14" rx="1.25" ry="1.32353" />
    <path
      d="M2 19.75H26.5706C26.9458 19.75 27.25 20.0542 27.25 20.4294
V24.2412V26C27.25 26.6904 26.6904 27.25 26 27.25H2C1.30964 27.25 0.75 26.6904 0.75 26
V21C0.75 20.3096 1.30964 19.75 2 19.75Z"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <ellipse cx="6.25" cy="23.5" rx="1.25" ry="1.32353" />
    <ellipse cx="10.25" cy="23.5" rx="1.25" ry="1.32353" />
    <ellipse cx="14.25" cy="23.5" rx="1.25" ry="1.32353" />
  </svg>

);

export const MisIcon = (props) => <Icon component={misSVG} {...props} />;

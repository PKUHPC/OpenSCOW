/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
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
  <svg width="1em" height="1em" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth="2" />
    <path
      d="M14 23C9.02944 23 5 18.9706 5 14C5 9.02944 9.02944 5 14 5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M14 5C15.4082 5 16.7408 5.32341 17.9277 5.9
    M14 23C18.9706 23 23 18.9706 23 14C23 12.7586 22.7487 11.5759 22.2941 10.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <circle cx="14" cy="14" r="2.25" stroke="currentColor" strokeWidth="1.5" />
    <path d="M16 12L20 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>


);


export const DashBoardIcon: React.ForwardRefExoticComponent<{}> = React.forwardRef((props,
  ref: LegacyRef<HTMLSpanElement> | undefined) => (
  <Icon component={dashBoardSVG} {...props} ref={ref} />
));

// 作业图标
const jobSVG = () => (
  <svg width="1em" height="1em" viewBox="0 0 29 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M1.16675 8V3C1.16675 1.89543 2.06218 1 3.16675 1H26.0001
C27.1047 1 28.0001 1.89543 28.0001 3V5.44706V17.3059V27C28.0001 28.1046 27.1047 29 26.0001 29
H3.16675C2.06218 29 1.16675 28.1046 1.16675 27V22"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path d="M1 8H6V9.54118V16.3176V22H1L1 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M10.5 11H22.1667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M10.5 15H19.8333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M10.5 19H17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>

);

export const JobIcon: React.ForwardRefExoticComponent<{}> = React.forwardRef((props,
  ref: LegacyRef<HTMLSpanElement> | undefined) => (
  <Icon component={jobSVG} {...props} ref={ref} />
));

// shell图标
const shellSVG = () => (
  <svg width="1em" height="1em" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="26" height="26" rx="1" stroke="currentColor" strokeWidth="2" />
    <line x1="6.55671e-08" y1="10.25" x2="28" y2="10.25" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="5" cy="6" r="1" fill="currentColor" />
    <circle cx="9" cy="6" r="1" fill="currentColor" />
    <circle cx="13" cy="6" r="1" fill="currentColor" />
    <path
      d="M7 15.6001L11.2 18.9251
    L7 22.2501"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M14 21.2002H20.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const ShellIcon: React.ForwardRefExoticComponent<{}> = React.forwardRef((props,
  ref: LegacyRef<HTMLSpanElement> | undefined) => (
  <Icon component={shellSVG} {...props} ref={ref} />
));

// 桌面图标
const desktopSVG = () => (
  <svg width="1em" height="1em" viewBox="0 0 30 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M7 7H3C1.89543 7 1 7.89543 1 9
    V26C1 27.1046 1.89543 28 3 28
    H27C28.1046 28 29 27.1046 29 26
    V9C29 7.89543 28.1046 7 27 7H23"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M8 1H22C22.5523 1 23 1.44771 23 2
    V3.65294V13.3941V21C23 21.5523 22.5523 22 22 22
    H8C7.44772 22 7 21.5523 7 21V2C7 1.44772 7.44772 1 8 1Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path d="M10.5 9H19.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M10.5 12H17.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M10.5 15H15.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const DesktopIcon: React.ForwardRefExoticComponent<{}> = React.forwardRef((props,
  ref: LegacyRef<HTMLSpanElement> | undefined) => (
  <Icon component={desktopSVG} {...props} ref={ref} />
));

// 交互式应用图标
const applicationSVG = () => (
  <svg width="1em" height="1em" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M26.4292 14.0916C26.4292 16.3292 25.7918 18.5214 24.5902 20.4165
    C23.3887 22.3116 21.6717 23.8326 19.6365 24.805"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M14.4161 1.18918C12.0487 1.18918 9.73399 1.88183 7.7628 3.18015
    C5.79161 4.47846 4.25177 6.32455 3.33667 8.48657"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <rect x="1" y="13.902" width="13.2475" height="13.0981" rx="1" stroke="currentColor" strokeWidth="2" />
    <rect x="18.585" y="0.75" width="8.66503" height="8.56538" rx="1.25" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export const ApplicationIcon: React.ForwardRefExoticComponent<{}> = React.forwardRef((props,
  ref: LegacyRef<HTMLSpanElement> | undefined) => (
  <Icon component={applicationSVG} {...props} ref={ref} />
));

// 文件管理图标
const fileManagerSVG = () => (
  <svg width="1em" height="1em" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M23 15V5.44706V3C23 1.89543 22.1046 1 21 1
    H3C1.89543 1 1 1.89543 1 3V27C1 28.1046 1.89543 29 3 29H12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M22.4615 28H15.7692L13 23.1648L15.7692 18
    H22.4615L25 23.1648L22.4615 28Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <circle cx="2" cy="2" r="2" transform="matrix(1 0 0 -1 17 25)" fill="currentColor" />
  </svg>
);

export const FileManagerIcon: React.ForwardRefExoticComponent<{}> = React.forwardRef((props,
  ref: LegacyRef<HTMLSpanElement> | undefined) => (
  <Icon component={fileManagerSVG} {...props} ref={ref} />
));

// 管理mis图标
const misSVG = () => (
  <svg width="1em" height="1em" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M2 0.75H26.5706C26.9458 0.75 27.25 1.05418 27.25 1.42941V5.24118V7
C27.25 7.69036 26.6904 8.25 26 8.25H2C1.30964 8.25 0.75 7.69036 0.75 7
V2C0.75 1.30964 1.30964 0.75 2 0.75Z"
      strokeWidth="1.5"
      strokeLinecap="round"
      stroke="currentColor"
    />
    <ellipse cx="6.25" cy="4.50004" rx="1.25" ry="1.32353" stroke="currentColor" />
    <ellipse cx="10.25" cy="4.50004" rx="1.25" ry="1.32353" stroke="currentColor" />
    <ellipse cx="14.25" cy="4.50004" rx="1.25" ry="1.32353" stroke="currentColor" />
    <path
      d="M2 10.25H26.5706C26.9458 10.25 27.25 10.5542 27.25 10.9294
V14.7412V16.5C27.25 17.1904 26.6904 17.75 26 17.75H2C1.30964 17.75 0.75 17.1904 0.75 16.5V11.5
C0.75 10.8096 1.30964 10.25 2 10.25Z"
      strokeWidth="1.5"
      strokeLinecap="round"
      stroke="currentColor"
    />
    <ellipse cx="6.25" cy="14" rx="1.25" ry="1.32353" stroke="currentColor" />
    <ellipse cx="10.25" cy="14" rx="1.25" ry="1.32353" stroke="currentColor" />
    <ellipse cx="14.25" cy="14" rx="1.25" ry="1.32353" stroke="currentColor" />
    <path
      d="M2 19.75H26.5706C26.9458 19.75 27.25 20.0542 27.25 20.4294
V24.2412V26C27.25 26.6904 26.6904 27.25 26 27.25H2C1.30964 27.25 0.75 26.6904 0.75 26
V21C0.75 20.3096 1.30964 19.75 2 19.75Z"
      strokeWidth="1.5"
      strokeLinecap="round"
      stroke="currentColor"
    />
    <ellipse cx="6.25" cy="23.5" rx="1.25" ry="1.32353" stroke="currentColor" />
    <ellipse cx="10.25" cy="23.5" rx="1.25" ry="1.32353" stroke="currentColor" />
    <ellipse cx="14.25" cy="23.5" rx="1.25" ry="1.32353" stroke="currentColor" />
  </svg>

);

export const MisIcon = (props) => <Icon component={misSVG} {...props} />;

// 所有作业图标
const allJobsSVG = () => (
  <svg width="1em" height="1em" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4.67859" y="5.57141" width="20.3214" height="19.4286" rx="1" stroke="#262743" strokeWidth="2" />
    <rect x="1.10718" y="1" width="7.82143" height="7.82143" rx="1" fill="white" stroke="#262743" strokeWidth="2" />
    <rect
      x="1.10718"
      y="12.7142"
      width="7.82143"
      height="7.82143"
      rx="1"
      fill="white"
      stroke="currentColor"
      strokeWidth="2"
    />
    <rect
      x="11.8214"
      y="1"
      width="7.82143"
      height="7.82143"
      rx="1"
      fill="white"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path d="M14.3928 15.2858H21.5357" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M14.3928 17.9642H19.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M14.3928 20.6428H17.9643" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>

);
export const AllJobsIcon: React.ForwardRefExoticComponent<{}> = React.forwardRef((props,
  ref: LegacyRef<HTMLSpanElement> | undefined) => (
  <Icon component={allJobsSVG} {...props} ref={ref} />
));

// 提交作业图标
const submitJobSVG = () => (
  <svg width="1em" height="1em" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.9231 20.6428L20.4616 20.6428" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M18.6923 18.8572L18.6923 22.4286" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path
      d="M22.2308 14.3929V4.97059
    V3C22.2308 1.89543 21.3353 1 20.2308 1H3C1.89543 1 1 1.89543 1 3
    V24C1 25.1046 1.89543 26 3 26H13.8269"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path d="M6.30768 9.92859H16.9231" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M6.30768 13.5H14.2692" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M6.30768 17.0714H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path
      d="M23.25 20.6429C23.25 23.1939 21.2029 25.2501 18.6923 25.2501
    C16.1817 25.2501 14.1346 23.1939 14.1346 20.6429C14.1346 18.0919 16.1817 16.0358 18.6923 16.0358
    C21.2029 16.0358 23.25 18.0919 23.25 20.6429Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);
export const SubmitJobIcon: React.ForwardRefExoticComponent<{}> = React.forwardRef((props,
  ref: LegacyRef<HTMLSpanElement> | undefined) => (
  <Icon component={submitJobSVG} {...props} ref={ref} />
));

// 未结束作业图标
const runningJobsSVG = () => (
  <svg width="1em" height="1em" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.2308 14.3929V4.97059V3
    C22.2308 1.89543 21.3353 1 20.2308 1H3C1.89543 1 1 1.89543 1 3V24C1 25.1046 1.89543 26 3 26H13.8269"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path d="M6.30768 9.92859H16.9231" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M6.30768 13.5H14.2692" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M6.30768 17.0714H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path
      d="M23.25 20.6429C23.25 23.1939 21.2029 25.2501 18.6923 25.2501
    C16.1817 25.2501 14.1346 23.1939 14.1346 20.6429C14.1346 18.0919 16.1817 16.0358 18.6923 16.0358
    C21.2029 16.0358 23.25 18.0919 23.25 20.6429Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M23.25 20.6429C23.25 23.1939 21.2029 25.2501 18.6923 25.2501
    C16.1817 25.2501 14.1346 23.1939 14.1346 20.6429C14.1346 18.0919 16.1817 16.0358 18.6923 16.0358
    C21.2029 16.0358 23.25 18.0919 23.25 20.6429Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path d="M18.6923 18.8572L18.6923 21.5357H20.4615" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
export const RunningJobsIcon: React.ForwardRefExoticComponent<{}> = React.forwardRef((props,
  ref: LegacyRef<HTMLSpanElement> | undefined) => (
  <Icon component={runningJobsSVG} {...props} ref={ref} />
));


// shell集群图标
const shellClusterSVG = () => (
  <svg width="1em" height="1em" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3.67856" y="1" width="17.6429" height="8.71429" rx="1" stroke="currentColor" strokeWidth="2" />
    <rect x="1" y="18.8572" width="5.14286" height="5.14286" rx="1" stroke="currentColor" strokeWidth="2" />
    <rect x="9.92856" y="18.8572" width="5.14286" height="5.14286" rx="1" stroke="currentColor" strokeWidth="2" />
    <rect x="18.8571" y="18.8572" width="5.14286" height="5.14286" rx="1" stroke="currentColor" strokeWidth="2" />
    <path d="M6.25 5.35718H10.7143" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M12.5 8.92859L12.5 19.6429" stroke="currentColor" strokeWidth="2" />
    <path
      d="M3.57144 19.6428V14.3928C3.57144 13.8405 4.01916 13.3928 4.57144 13.3928
    H20.4286C20.9809 13.3928 21.4286 13.8405 21.4286 14.3928V19.6428"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);
export const ShellClusterIcon: React.ForwardRefExoticComponent<{}> = React.forwardRef((props,
  ref: LegacyRef<HTMLSpanElement> | undefined) => (
  <Icon component={shellClusterSVG} {...props} ref={ref} />
));

// 集群文件管理图标
const clusterFileManagerSVG = () => (
  <svg width="1em" height="1em" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.1438 2H3.00003V4.25H12.1724L11.1438 2
    ZM3.00003 0C1.89546 0 1.00003 0.89543 1.00003 2V4.01347C0.931494 4.14893 0.892883 4.3021 0.892883 4.46429
    V6.25C0.892883 6.39257 0.922719 6.52817 0.976487 6.6509C0.921837 6.87738 0.892883 7.11388 0.892883 7.35714
    V22.1071C0.892883 23.764 2.23603 25.1071 3.89288 25.1071H11.4273C11.9796 25.1071 12.4273 24.6594 12.4273 24.1071
    C12.4273 23.5549 11.9796 23.1071 11.4273 23.1071H3.89288C3.3406 23.1071 2.89288 22.6594 2.89288 22.1071V7.35714
    C2.89288 6.80486 3.3406 6.35714 3.89288 6.35714H23.1072C23.6595 6.35714 24.1072 6.80486 24.1072 7.35714
    V13.1017C24.1072 13.654 24.5549 14.1017 25.1072 14.1017C25.6595 14.1017 26.1072 13.654 26.1072 13.1017V7.35714
    C26.1072 5.70029 24.764 4.35714 23.1072 4.35714H14.1718
    C14.1886 4.04871 14.1331 3.7286 13.9913 3.41848L12.9628 1.16848
    C12.6373 0.456608 11.9265 0 11.1438 0H3.00003ZM15 12.2143
    V14.5714H21.8215V12.2143H15ZM14.5 10.7143C13.9477 10.7143 13.5 11.162 13.5 11.7143V15.0714
    C13.5 15.2761 13.5615 15.4665 13.6671 15.625
    C13.5615 15.7835 13.5 15.9739 13.5 16.1786V19.5357C13.5 19.7404 13.5615 19.9308 13.6671 20.0893
    C13.5615 20.2478 13.5 20.4381 13.5 20.6429
    V24C13.5 24.5523 13.9477 25 14.5 25H22.3215C22.8737 25 23.3215 24.5523 23.3215 24V20.6429
    C23.3215 20.4381 23.2599 20.2478 23.1544 20.0893
    C23.2599 19.9308 23.3215 19.7404 23.3215 19.5357V16.1786C23.3215 15.9739 23.2599 15.7835 23.1544 15.625
    C23.2599 15.4665 23.3215 15.2761 23.3215 15.0714V11.7143C23.3215 11.162 22.8737 10.7143 22.3215 10.7143
    H14.5ZM15 16.6786V19.0357H21.8215V16.6786H15ZM15 23.5V21.1429H21.8215V23.5H15ZM15.6199 13.3929
    C15.6199 12.9786 15.9557 12.6429 16.3699 12.6429H18.7615
    C19.1757 12.6429 19.5115 12.9786 19.5115 13.3929C19.5115 13.8071 19.1757 14.1429 18.7615 14.1429H16.3699
    C15.9557 14.1429 15.6199 13.8071 15.6199 13.3929ZM16.3699 17.1071C15.9557 17.1071 15.6199 17.4429 15.6199 17.8571
    C15.6199 18.2714 15.9557 18.6071 16.3699 18.6071H18.7615C19.1757 18.6071 19.5115 18.2714 19.5115 17.8571
    C19.5115 17.4429 19.1757 17.1071 18.7615 17.1071H16.3699ZM15.6199 22.3214
    C15.6199 21.9072 15.9557 21.5714 16.3699 21.5714
    18.7615C19.1757 21.5714 19.5115 21.9072 19.5115 22.3214C19.5115 22.7356 19.1757 23.0714 18.7615 23.0714
    H16.3699C15.9557 23.0714 15.6199 22.7356 15.6199 22.3214Z"
      fill="currentColor"
    />
  </svg>
);
export const ClusterFileManagerIcon: React.ForwardRefExoticComponent<{}> = React.forwardRef((props,
  ref: LegacyRef<HTMLSpanElement> | undefined) => (
  <Icon component={clusterFileManagerSVG} {...props} ref={ref} />
));

// 创建应用图标
const createAppSVG = () => (
  <svg width="1em" height="1em" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="9.5" height="9.5" rx="1" stroke="currentColor" strokeWidth="2" />
    <rect x="1" y="14.3928" width="9.5" height="9.5" rx="1" stroke="currentColor" strokeWidth="2" />
    <rect x="14.3929" y="1" width="9.5" height="9.5" rx="1" stroke="currentColor" strokeWidth="2" />
    <path d="M15 19L23 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M19 15L19 23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
export const CreateAppIcon: React.ForwardRefExoticComponent<{}> = React.forwardRef((props,
  ref: LegacyRef<HTMLSpanElement> | undefined) => (
  <Icon component={createAppSVG} {...props} ref={ref} />
));

// 已创建APP图标
const appSessionsSVG = () => (
  <svg width="1em" height="1em" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="9.5" height="9.5" rx="1" stroke="currentColor" strokeWidth="2" />
    <rect x="1" y="14.3928" width="9.5" height="9.5" rx="1" stroke="currentColor" strokeWidth="2" />
    <rect x="14" y="14" width="10" height="10" rx="5" fill="currentColor" stroke="currentColor" strokeWidth="2" />
    <rect x="14.3929" y="1" width="9.5" height="9.5" rx="1" stroke="currentColor" strokeWidth="2" />
    <path
      d="M17 19.2857L18.4545 21
    L21 18"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
export const AppSessionsIcon: React.ForwardRefExoticComponent<{}> = React.forwardRef((props,
  ref: LegacyRef<HTMLSpanElement> | undefined) => (
  <Icon component={appSessionsSVG} {...props} ref={ref} />
));

// 进入图标
const inSVG = () => (
  <svg width="1em" height="1em" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10.5303 9.03033C10.8232 8.73744 10.8232 8.26256 10.5303 7.96967L5.75736 3.1967
    C5.46447 2.90381 4.98959 2.90381 4.6967 3.1967C4.40381 3.48959 4.40381 3.96447 4.6967 4.25736L8.93934 8.5
    L4.6967 12.7426C4.40381 13.0355 4.40381 13.5104 4.6967 13.8033C4.98959 14.0962 5.46447 14.0962 5.75736 13.8033
    L10.5303 9.03033ZM1 7.75C0.585787 7.75 0.25 8.08579 0.25 8.5C0.25 8.91421 0.585787 9.25 1 9.25V7.75ZM10 7.75L1 7.75
    V9.25L10 9.25V7.75Z"
      fill="currentColor"
    />
    <path
      d="M9 1H14C15.1046 1 16 1.89543 16 3V14C16 15.1046 15.1046 16 14 16
    H9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const InIcon: React.ForwardRefExoticComponent<{}> = React.forwardRef((props,
  ref: LegacyRef<HTMLSpanElement> | undefined) => (
  <Icon component={inSVG} {...props} ref={ref} />
));

// 作业模板图标
const templateJobSVG = () => (
  <svg width="1em" height="1em" viewBox="0 0 23 25" fill="none" xmlns="http://www.w3.org/2000/svg">
    <mask id="path-1-inside-1_840_4698" fill="white">
      <rect x="4" y="3" width="15" height="6" rx="1" />
    </mask>
    <rect
      x="4"
      y="3"
      width="15"
      height="6"
      rx="1"
      fill="white"
      stroke="currentColor"
      strokeWidth="3"
      mask="url(#path-1-inside-1_840_4698)"
    />
    <rect x="4.5" y="11.5" width="6" height="1" rx="0.5" fill="white" stroke="currentColor" />
    <rect x="4.5" y="14.5" width="6" height="1" rx="0.5" fill="white" stroke="currentColor" />
    <mask id="path-4-inside-2_840_4698" fill="white">
      <rect x="4" y="17" width="7" height="5" rx="1" />
    </mask>
    <rect
      x="4"
      y="17"
      width="7"
      height="5"
      rx="1"
      fill="white"
      stroke="currentColor"
      strokeWidth="3"
      mask="url(#path-4-inside-2_840_4698)"
    />
    <mask id="path-5-inside-3_840_4698" fill="white">
      <rect width="7" height="12" rx="1" transform="matrix(-1 0 0 1 19 10)" />
    </mask>
    <rect
      width="7"
      height="12"
      rx="1"
      transform="matrix(-1 0 0 1 19 10)"
      fill="white"
      stroke="currentColor"
      strokeWidth="3"
      mask="url(#path-5-inside-3_840_4698)"
    />
    <path
      d="M2 1H21C21.5523 1 22 1.44771 22 2V3.97059V14.5588V23C22 23.5523 21.5523 24 21 24
      H2C1.44771 24 1 23.5523 1 23V2C1 1.44772 1.44772 1 2 1Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const TemplateJobIcon: React.ForwardRefExoticComponent<{}> = React.forwardRef((props,
  ref: LegacyRef<HTMLSpanElement> | undefined) => (
  <Icon component={templateJobSVG} {...props} ref={ref} />
));

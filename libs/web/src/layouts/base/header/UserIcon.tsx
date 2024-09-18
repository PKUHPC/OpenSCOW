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

const userSVG = () => (
  <svg width="1em" height="1em" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="14" cy="8" r="7" stroke="currentColor" stroke-width="2" />
    <path
      d="M26.9621 27H1.03789C1.54851 20.2876 7.15677 15 14 15C20.8432 15 26.4515 20.2876 26.9621 27Z"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>

);

export const USerIcon: React.ForwardRefExoticComponent<{}> = React.forwardRef((props,
  ref: LegacyRef<HTMLSpanElement> | undefined) => (
  <Icon component={userSVG} {...props} ref={ref} />
));

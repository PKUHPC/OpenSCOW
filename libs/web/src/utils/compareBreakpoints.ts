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

const breakpointsSize = {
  "xxsmall": 1,
  "xsmall": 2,
  "small": 3,
  "medium": 4,
  "large": 5,
  "xlarge": 6,
  "xxlarge": 7,
};

type Breakpoint = keyof typeof breakpointsSize;

export function compareBreakpoints(bp1: string, bp2: Breakpoint): -1 | 0 | 1 {
  const n1 = breakpointsSize[bp1];
  const n2 = breakpointsSize[bp2];
  return n1 < n2 ? -1 : n1 === n2 ? 0 : 1;
}

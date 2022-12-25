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

export function max(op1: number, op2: number) {
  return op1 > op2 ? op1 : op2;
}
export function min(op1: number, op2: number) {
  return op1 < op2 ? op1 : op2;
}

export function compareNumber(a: number, b: number): -1 | 0 | 1 {
  if (a === b) { return 0; }
  if (a < b) { return -1; }
  return 1;
}


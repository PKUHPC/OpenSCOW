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

const DEFAULT_UNIT_MAP = ["KB", "MB", "GB", "TB", "PB"];

/**
 * 传入size的单位应为unitMap的最小单位，默认传入KB
 * @param size
 * @param unitMap
 * @returns
 */
export const formatSize = (size: number, unitMap: string[] = DEFAULT_UNIT_MAP): string => {

  const CARRY = 1024;
  const maxSize = Math.pow(CARRY, unitMap.length);

  if (size >= maxSize) {
    return "";
  }

  let carryCount = 0;

  while (size > CARRY) {
    size = size / CARRY;
    carryCount++;
  }

  if (size >= 1000) {
    size = size / CARRY;
    carryCount++;
  }

  const fixedNumber = size < 9.996 ? 2 : (size < 99.95 ? 1 : 0);
  return `${size.toFixed(fixedNumber)} ${unitMap[carryCount]}`;
};

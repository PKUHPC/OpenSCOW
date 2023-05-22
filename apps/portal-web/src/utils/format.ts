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

export const formatSize = (size: number, unitMap: string[] = DEFAULT_UNIT_MAP): string => {

  const CARRY = 1024;
  const maxSize = Math.pow(CARRY, unitMap.length);

  if (size >= maxSize) {
    return "";
  }

  let carryCount = 0;
  let decimalSize = Math.round(size / CARRY);

  while (decimalSize > CARRY) {
    decimalSize = decimalSize / CARRY;
    carryCount++;
  }

  if (decimalSize >= 1000) {
    decimalSize = decimalSize / CARRY;
    carryCount++;
  }

  const fixedNumber = decimalSize < 9.996 ? 2 : (decimalSize < 99.95 ? 1 : 0);
  return `${decimalSize.toFixed(fixedNumber)} ${unitMap[carryCount]}`;
};

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

import { customAlphabet } from "nanoid";


// slurm username is all lowercase
const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
const number = "0123456789";

const numberCaseId = customAlphabet(number, 4);
/**
 *
 * @param length
 * @returns 只包含小写字母和数字
 */
export function genRandomStringWithLowercaseAndNumber(length: number) {
  const nanoid = customAlphabet(alphabet, length);

  const randomString = nanoid();

  return randomString;
}

export const genVerification = () => numberCaseId();

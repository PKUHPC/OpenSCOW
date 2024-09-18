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

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type AnyJson = boolean | number | string | null | JsonArray | JsonMap;
// @ts-ignore
export type JsonMap = Record<string, AnyJson>;
interface JsonArray extends Array<AnyJson> {}

export type ValueOf<T> = T[keyof T];

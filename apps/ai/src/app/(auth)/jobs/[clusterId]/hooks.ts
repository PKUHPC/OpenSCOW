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

import { UseQueryResult } from "@tanstack/react-query";
import { Form, FormInstance } from "antd";
import { useMemo } from "react";

import { AccessiblityType } from "./LaunchAppForm";

interface Option {
  label: string;
  value: number;
}

type DataType = "dataset" | "algorithm" | "model"

// trpc 钩子函数的类型
interface QueryHookFunction<TQueryFnData = any, TError = any, TData = any> {
  (args: TQueryFnData, options?: any): UseQueryResult<TData, TError>;
}

export function useDataOptions<T>(
  form: FormInstance,
  dataType: DataType,
  queryHook: QueryHookFunction<any, any, { items: T[] }>,
  clusterId: string,
  mapItemToOption: (item: T) => Option,
): { dataOptions: Option[], isDataLoading: boolean } {
  const typePath = [dataType, "type"];
  const itemType = Form.useWatch(typePath, form);
  const isItemPublic = itemType !== undefined ? itemType === AccessiblityType.PUBLIC : itemType;

  const queryInput = dataType === "algorithm" ? { isPublic : isItemPublic } : { isShared : isItemPublic };

  const { data: items, isLoading: isDataLoading } = queryHook({
    ...queryInput, clusterId,
  }, { enabled: isItemPublic !== undefined });

  const dataOptions = useMemo(() => {
    return items?.items.map(mapItemToOption) || [];
  }, [items]);

  return { dataOptions, isDataLoading: isDataLoading && isItemPublic !== undefined };
}

export function useDataVersionOptions<T>(
  form: FormInstance,
  dataType: DataType,
  queryHook: QueryHookFunction,
  mapItemToOption: (item: T) => Option,
): { dataVersionOptions: Option[], isDataVersionsLoading: boolean } {
  const typePath = [dataType, "type"];
  const namePath = [dataType, "name"];
  const selectedItem = Form.useWatch(namePath, form);
  const itemType = Form.useWatch(typePath, form);
  const isItemPublic = itemType !== undefined ? itemType === AccessiblityType.PUBLIC : itemType;

  const queryInput = dataType === "algorithm" ? { isPublic : isItemPublic } : { isShared : isItemPublic };

  const { data: versions, isLoading: isDataVersionsLoading } = queryHook({
    [`${dataType}Id`]: selectedItem, ...queryInput,
  }, { enabled: selectedItem !== undefined });

  const dataVersionOptions = useMemo(() => {
    return versions?.items.map(mapItemToOption);
  }, [versions]);

  return { dataVersionOptions, isDataVersionsLoading: isDataVersionsLoading && selectedItem !== undefined };
}

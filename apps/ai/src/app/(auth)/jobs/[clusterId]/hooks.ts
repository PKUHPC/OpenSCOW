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

import { UseQueryResult } from "@tanstack/react-query";
import { Form, FormInstance } from "antd";
import { useMemo } from "react";
import { parseBooleanParam } from "src/utils/parse";

import { AccessibilityType } from "./LaunchAppForm";

interface Option {
  label: string;
  value: number;
}

type DataType = "dataset" | "algorithm" | "model";

type QueryHookFunction<TQueryFnData = any, TError = any, TData = any> =
  (args: TQueryFnData, options?: any) => UseQueryResult<TData, TError>;

export function useDataOptions<T>(
  form: FormInstance,
  dataType: DataType,
  queryHook: QueryHookFunction<any, any, { items: T[] }>,
  clusterId: string,
  mapItemToOption: (item: T) => Option,
): { data: T[], dataOptions: Option[], isDataLoading: boolean } {
  const typePath = [dataType, "type"];
  const itemType = Form.useWatch(typePath, form);
  const isItemPublic = itemType !== undefined ? itemType === AccessibilityType.PUBLIC : itemType;
  const { data: items, isLoading: isDataLoading } = queryHook({
    isPublic : isItemPublic !== undefined ? parseBooleanParam(isItemPublic) : undefined,
    clusterId,
  }, { enabled: isItemPublic !== undefined });

  const dataOptions = useMemo(() => {
    return items?.items.map(mapItemToOption) || [];
  }, [items]);

  return { data: items?.items || [], dataOptions, isDataLoading: isDataLoading && isItemPublic !== undefined };
}

export function useDataVersionOptions<T>(
  form: FormInstance,
  dataType: DataType,
  queryHook: QueryHookFunction,
  mapItemToOption: (item: T) => Option,
): { dataVersions: T[], dataVersionOptions: Option[], isDataVersionsLoading: boolean } {
  const typePath = [dataType, "type"];
  const namePath = [dataType, "name"];
  const selectedItem = Form.useWatch(namePath, form);
  const itemType = Form.useWatch(typePath, form);
  const isItemPublic = itemType !== undefined ? itemType === AccessibilityType.PUBLIC : itemType;

  const { data: versions, isLoading: isDataVersionsLoading } = queryHook({
    [`${dataType}Id`]: selectedItem,
    isPublic : isItemPublic !== undefined ? parseBooleanParam(isItemPublic) : undefined,
  }, { enabled: selectedItem !== undefined });

  const dataVersionOptions = useMemo(() => {
    return versions?.items.map(mapItemToOption);
  }, [versions]);

  return {
    dataVersions: versions?.items || [],
    dataVersionOptions,
    isDataVersionsLoading: isDataVersionsLoading && selectedItem !== undefined,
  };
}

interface EntityWithVersions {
  id: number;
  versions: {
    id: number,
    path: string
  }[];
}

interface Version {
  id: number;
}

export function setEntityInitData<T extends Version, U extends EntityWithVersions>(
  entityType: "algorithm" | "dataset" | "model",
  entities: U[],
  versions: T[],
  entityId: number,
  isPrivate: boolean,
  form: FormInstance,
  setShowKey: string,
) {
  form.setFieldValue(setShowKey, true);
  form.setFieldValue([entityType, "type"], isPrivate ? AccessibilityType.PRIVATE : AccessibilityType.PUBLIC);

  const foundEntity = entities.find((entity) =>
    entity.versions.some((version) => version.id === entityId),
  );

  if (foundEntity) {
    form.setFieldValue([entityType, "name"], foundEntity.id);
    if (versions.length) {
      const hasVersion = versions.some((version) => version.id === entityId);
      if (hasVersion) {
        form.setFieldValue([entityType, "version"], entityId);
      }
    }
  }
}

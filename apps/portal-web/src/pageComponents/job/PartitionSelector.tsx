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

import { ReloadOutlined } from "@ant-design/icons";
import { Button, Select, Space, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { publicConfig } from "src/utils/config";

interface Props {
  selectablePartitions: string[];
  isLoading: boolean;
  value?: string;
  onChange?: (value: string) => void;
  onReload?: () => void;
}

export const PartitionSelector: React.FC<Props> = ({ selectablePartitions,
  isLoading, onChange, value, onReload }) => {

  const t = useI18nTranslateToString();
  const p = prefix("pageComp.job.partitionSelector.");
  const [placeholder, setPlaceholder] = useState(t(p("selectPartitionPlaceholder")));
  const isResourceDeployed = publicConfig.SCOW_RESOURCE_ENABLED;

  useEffect(() => {

    if (isLoading) {
      setPlaceholder(t(p("isLoading")));
    } else {

      if (selectablePartitions.length > 0 && !value) {
        onChange?.(selectablePartitions[0]);
      }

      if (selectablePartitions.length === 0) {
        setPlaceholder(isResourceDeployed ? t(p("noAssignedPartition")) : t(p("noAvailablePartition")));
      }
    }

  }, [selectablePartitions, value, isLoading]);

  return (
    <Space.Compact style={{ width: "100%" }}>
      <Select
        loading={isLoading}
        options={selectablePartitions ? selectablePartitions.map((x) => ({ label: x, value: x })) : []}
        placeholder={placeholder}
        value={isLoading ? undefined : value}
        style={{ width: "calc(100% - 32px)" }}
        onChange={(v) => onChange?.(v)}
      />
      <Tooltip title={t(p("refreshPartitionList"))}>
        <Button
          icon={<ReloadOutlined spin={isLoading} />}
          onClick={() => onReload?.()}
          loading={isLoading}
        />
      </Tooltip>
    </Space.Compact>
  );
};


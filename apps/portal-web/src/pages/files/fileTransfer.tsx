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

import { HomeOutlined, LeftOutlined, RightOutlined, UpOutlined } from "@ant-design/icons";
import { compareDateTime, formatDateTime } from "@scow/lib-web/build/utils/datetime";
import { compareNumber } from "@scow/lib-web/build/utils/math";
import { Button, Table, Transfer } from "antd";
import type { ColumnsType, TableRowSelection } from "antd/es/table/interface";
import type { TransferItem, TransferProps } from "antd/es/transfer";
import difference from "lodash/difference";
import React, { useState } from "react";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { FileInfo, FileType } from "src/pages/api/file/list";
import { Cluster } from "src/utils/config";
import styled from "styled-components";


interface FileItem extends FileInfo {
  clusterId: string;
}

interface TableTransferProps extends TransferProps<TransferItem> {
  dataSource: FileItem[];
  leftColumns: ColumnsType<FileInfo>;
  rightColumns: ColumnsType<FileInfo>;
  leftCluster: Cluster | undefined;
  rightCluster: Cluster | undefined;
  leftPath: string | undefined;
  rightPath: string | undefined;
  leftURLPrefix: string | undefined;
  rightURLPrefix: string | undefined;
}

// 解析权限函数
const nodeModeToString = (mode: number) => {
  const numberPermission = (mode & parseInt("777", 8)).toString(8);

  const toStr = (char: string) => {
    const num = +char;
    return ((num & 4) !== 0 ? "r" : "-") + ((num & 2) !== 0 ? "w" : "-") + ((num & 1) !== 0 ? "x" : "-");
  };

  return [0, 1, 2].reduce((prev, curr) => prev + toStr(numberPermission[curr]), "");
};

const TopBar = styled(FilterFormContainer)`
  display: flex;
  flex-direction: row;
  padding-bottom: 8px;

  &>button {
    margin: 0px 4px;
  }
`;

// 自定义Table Transfer
const TableTransfer = ({ leftColumns, rightColumns, leftPath, rightPath, ...restProps }: TableTransferProps) => (
  <Transfer {...restProps}>
    {({
      direction,
      filteredItems,
      onItemSelectAll,
      onItemSelect,
      selectedKeys: listSelectedKeys,
      disabled: listDisabled,
    }) => {
      const rowSelection: TableRowSelection<TransferItem> = {
        getCheckboxProps: (item) => ({ disabled: listDisabled || item.disabled }),
        onSelectAll(selected, selectedRows) {
          const treeSelectedKeys = selectedRows
            .filter((item) => !item.disabled)
            .map(({ key }) => key);
          const diffKeys = selected
            ? difference(treeSelectedKeys, listSelectedKeys)
            : difference(listSelectedKeys, treeSelectedKeys);
          onItemSelectAll(diffKeys as string[], selected);
        },
        onSelect({ key }, selected) {
          onItemSelect(key as string, selected);
        },
        selectedRowKeys: listSelectedKeys,
      };
      const columns = direction === "left" ? leftColumns : rightColumns;


      return (
        <>
          <TopBar>
            <Button icon={<LeftOutlined />} shape="circle" />
            <Button icon={<RightOutlined />} shape="circle" />
            <Button icon={<HomeOutlined />} shape="circle" />
            <Button icon={<UpOutlined />} shape="circle" />
          </TopBar>
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={filteredItems}
            size="small"
            style={{ pointerEvents: listDisabled ? "none" : undefined }}
            onRow={({ name }) => ({
              onClick: () => {
                onItemSelect(name as string, !listSelectedKeys.includes(name as string));
              },
            })}
          />
        </>
      );
    }}
  </Transfer>
);


const mockData: FileItem[] = Array.from({ length: 20 }).map((_, i) => ({
  clusterId: i < 10 ? "cluster1" : "cluster2",
  name: i.toString(),
  type: "FILE" as FileType,
  mtime: `content${i + 1}`,
  size: 1024 * (i + 1),
  mode: 0o777,
}));

const originTargetKeys = mockData
  .filter((item) => item.clusterId === "cluster2")
  .map((item) => item.name);

const TableColumns: ColumnsType<FileInfo> = [
  {
    dataIndex: "clusterId",
    title: "集群ID",
  },
  {
    dataIndex: "name",
    title: "文件名",
    sorter: (a, b) => a.name.localeCompare(b.name),
    sortDirections: ["ascend", "descend"],
  },
  {
    dataIndex: "mtime",
    title: "修改日期",
    render: (mtime: string | undefined) => mtime ? formatDateTime(mtime) : "",
    sorter: (a, b) => compareDateTime(a.mtime, b.mtime),
  },
  {
    dataIndex: "size",
    title: "大小",
    render: (size: number | undefined) => size === undefined ? "" : Math.floor(size / 1024) + " KB",
    sorter: (a, b) => compareNumber(a.size, b.size),
  },
  {
    dataIndex: "mode",
    title: "权限",
    render: (mode: number | undefined) => mode === undefined ? "" : nodeModeToString(mode),
  },
];


const FileTransferPage: React.FC = () => {
  const [targetKeys, setTargetKeys] = useState<string[]>(originTargetKeys);

  const [leftCluster, setLeftCluster] = useState<Cluster>();
  const [rightCluster, setRightCluster] = useState<Cluster>();
  const [leftPath, setLeftPath] = useState<string>("");
  const [rightPath, setRightPath] = useState<string>("");
  const [leftURLPrefix, setLeftURLPrefix] = useState<string>("");
  const [rightURLPrefix, setRightURLPrefix] = useState<string>("");

  const onChange = (nextTargetKeys: string[]) => {
    setTargetKeys(nextTargetKeys);
  };

  return (
    <>
      <TableTransfer
        rowKey={(record) => record.name}
        dataSource={mockData}
        targetKeys={targetKeys}
        onChange={onChange}
        filterOption={
          (inputValue, item) => item.title!.indexOf(inputValue) !== -1 || item.tag.indexOf(inputValue) !== -1}
        leftColumns={TableColumns}
        rightColumns={TableColumns}
        leftCluster={leftCluster}
        rightCluster={rightCluster}
        leftPath={leftPath}
        rightPath={rightPath}
        leftURLPrefix={leftURLPrefix}
        rightURLPrefix={rightURLPrefix}
      />
    </>
  );
};

export default FileTransferPage;

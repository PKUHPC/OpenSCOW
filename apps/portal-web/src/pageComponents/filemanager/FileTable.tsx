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

import { CloseOutlined, FileOutlined, FolderOutlined } from "@ant-design/icons";
import { compareDateTime, formatDateTime } from "@scow/lib-web/build/utils/datetime";
import { compareNumber } from "@scow/lib-web/build/utils/math";
import { Table, TableProps, Tooltip } from "antd";
import React from "react";
import { FileInfo, FileType } from "src/pages/api/file/list";

const nodeModeToString = (mode: number) => {
  const numberPermission = (mode & parseInt("777", 8)).toString(8);

  const toStr = (char: string) => {
    const num = +char;
    return ((num & 4) !== 0 ? "r" : "-") + ((num & 2) !== 0 ? "w" : "-") + ((num & 1) !== 0 ? "x" : "-");
  };

  return [0, 1, 2].reduce((prev, curr) => prev + toStr(numberPermission[curr]), "");
};

const formatFileSize = (size: number): string => {
  const unitMap = ["KB", "MB", "GB", "TB", "PB"];
  const CARRY = 1024;
  // 最大1024TB
  const MAX_SIZE = 1024 * 1024 * 1024 * 1024 * 1024;

  if (size >= MAX_SIZE) {
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

interface Props extends TableProps<FileInfo> {
  files: FileInfo[];
  filesFilter?: (files: FileInfo[]) => FileInfo[];
  fileNameRender?: (fileName: string, r: FileInfo) => React.ReactNode;
  actionRender?: (_, r: FileInfo) => React.ReactNode;
}

const fileTypeIcons = {
  "FILE": FileOutlined,
  "DIR": FolderOutlined,
  "ERROR": CloseOutlined,
} as Record<FileType, React.ComponentType>;

export const FileTable: React.FC<Props> = (
  {
    files,
    fileNameRender,
    actionRender,
    filesFilter,
    ...otherProps
  },
) => {
  return (
    <Table
      {...otherProps}
      dataSource={filesFilter ? filesFilter(files) : files}
      pagination={false}
      size="small"
      scroll={{ x: true }}
    >
      <Table.Column<FileInfo>
        dataIndex="type"
        title=""
        width="32px"
        render={(_, r) => (
          React.createElement(fileTypeIcons[r.type])
        )}
      />

      <Table.Column<FileInfo>
        dataIndex="name"
        title="文件名"
        defaultSortOrder={"ascend"}
        sorter={
          (a, b) => a.type.localeCompare(b.type) === 0
            ? a.name.localeCompare(b.name)
            : a.type.localeCompare(b.type)
        }
        sortDirections={["ascend", "descend"]}
        render={fileNameRender}
      />

      <Table.Column<FileInfo>
        dataIndex="mtime"
        title="修改日期"
        render={(mtime: string | undefined) => mtime ? formatDateTime(mtime) : ""}
        sorter={
          (a, b) => a.type.localeCompare(b.type) === 0
            ? compareDateTime(a.mtime, b.mtime) === 0
              ? a.name.localeCompare(b.name)
              : compareDateTime(a.mtime, b.mtime)
            : a.type.localeCompare(b.type)
        }
      />
      <Table.Column<FileInfo>
        dataIndex="size"
        title="大小"
        render={
          (size: number | undefined, file: FileInfo) =>
            (size === undefined || file.type === "DIR")
              ? ""
              : (
                <Tooltip title={Math.round((size) / 1024).toLocaleString() + "KB"} placement="topRight">
                  <span>{formatFileSize(size)}</span>
                </Tooltip>
              )
        }
        sorter={
          (a, b) => {
            return a.type.localeCompare(b.type) === 0
              ? compareNumber(a.size, b.size) === 0
                ? a.name.localeCompare(b.name)
                : compareNumber(a.size, b.size)
              : a.type.localeCompare(b.type);
          }}
      />
      <Table.Column<FileInfo>
        dataIndex="mode"
        title="权限"
        render={(mode: number | undefined) => mode === undefined ? "" : nodeModeToString(mode)}
      />
      {actionRender ? (
        <Table.Column<FileInfo>
          dataIndex="action"
          title="操作"
          render={actionRender}
        />
      ) : undefined}

    </Table>
  );
};

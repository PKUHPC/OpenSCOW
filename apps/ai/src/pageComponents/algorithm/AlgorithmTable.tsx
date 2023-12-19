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

"use client";

import { PlusOutlined } from "@ant-design/icons";
import { App, Button, Divider, Form, Input, Select, Space, Table } from "antd";
import NextError from "next/error";
import { useState } from "react";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { ModalButton } from "src/components/ModalLink";
import { AlgorithmTypeText } from "src/models/Algorithm";
import { trpc } from "src/utils/trpc";

import { CreateAndEditAlgorithmModal } from "./CreateAndEditAlgorithmModal";
import { CreateAndEditVersionModal } from "./CreateAndEditVersionModal";
import { VersionListModal } from "./VersionListModal";

interface Props {
  isPublic: boolean;
}

const FilterType = {
  ALL: "全部",
  ...AlgorithmTypeText,
} as const;

type FilterTypeKeys = keyof typeof FilterType;

interface FilterForm {
  owner?: string,
  type?: FilterTypeKeys,
  nameOrDesc?: string,
}

interface PageInfo {
  page: number;
  pageSize?: number;
}

const CreateAlgorithmModalButton =
ModalButton(CreateAndEditAlgorithmModal, { type: "primary", icon: <PlusOutlined /> });
const EditAlgorithmModalButton =
ModalButton(CreateAndEditAlgorithmModal, { type: "link" });
const CreateAndEditVersionModalButton = ModalButton(CreateAndEditVersionModal, { type: "link" });
const VersionListModalButton = ModalButton(VersionListModal, { type: "link" });

export const AlgorithmTable: React.FC<Props> = ({ isPublic }) => {

  const [query, setQuery] = useState<FilterForm>(() => {
    return {
      owner: undefined,
      nameOrDesc: undefined,
      type: undefined,
    };
  });

  const [form] = Form.useForm<FilterForm>();

  const [pageInfo, setPageInfo] = useState<PageInfo>({ page: 1, pageSize: 10 });

  const { data, isFetching, error } = trpc.dataset.list.useQuery({
    ...pageInfo, ...query,
  });

  const { message } = App.useApp();

  if (error) {
    message.error("找不到算法");
  }

  return (
    <div>
      <FilterFormContainer style={{ display: "flex", justifyContent: "space-between" }}>
        <Form<FilterForm>
          layout="inline"
          form={form}
          initialValues={query}
          onFinish={async () => {
            const { nameOrDesc } = await form.validateFields();
            setQuery({ ...query, nameOrDesc: nameOrDesc?.trim() });
            setPageInfo({ page: 1, pageSize: pageInfo.pageSize });
          }}
        >
          <Form.Item label="算法框架" name="type">
            <Select
              style={{ minWidth: "120px" }}
              allowClear
              onChange={(val: FilterTypeKeys) => {
                setQuery({ ...query, type:val });
              }}
              placeholder="请选择算法框架"
              defaultValue={"ALL"}
              options={
                Object.entries(FilterType).map(([key, value]) => ({ label:value, value:key }))}
            >
            </Select>
          </Form.Item>
          <Form.Item name="nameOrDesc">
            <Input allowClear placeholder="名称或描述" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">搜索</Button>
          </Form.Item>
        </Form>
        {!isPublic && (
          <Space>
            <CreateAlgorithmModalButton> 添加 </CreateAlgorithmModalButton>
          </Space>
        )}
      </FilterFormContainer>
      <Table
        rowKey="id"
        dataSource={data?.items}
        loading={isFetching}
        columns={[
          { dataIndex: "name", title: "名称" },
          { dataIndex: "type", title: "算法框架" },
          { dataIndex: "description", title: "算法描述" },
          { dataIndex: "versions", title: "版本数量",
            render: (_, r) => {
              // return r.versions.length;
              return 1;
            } },
          isPublic ? { dataIndex: "shareUser", title: "分享者",
            render: (_, r) => {
              // return r.owner;
              return "demo_admin";
            } } : {},
          { dataIndex: "createTime", title: "创建时间" },
          { dataIndex: "action", title: "操作",
            render: (_, r) => {
              return !isPublic ?
                (
                  <>
                    <CreateAndEditVersionModalButton
                      algorithmId={r.id}
                      algorithmName={r.name}
                    >
                        创建新版本
                    </CreateAndEditVersionModalButton>
                    <VersionListModalButton
                      algorithmId={r.id}
                      algorithmName={r.name}
                    >
                        版本列表
                    </VersionListModalButton>
                    <EditAlgorithmModalButton
                      algorithmName={r.name}
                      algorithmFramework={r.type}
                      algorithmDescription={r.description}
                    >
                        编辑
                    </EditAlgorithmModalButton>
                    <Button
                      type="link"
                      onClick={() => {

                      }}
                    >
                    删除
                    </Button>
                  </>
                ) :
                (
                  <VersionListModalButton key='版本列表' algorithmId={1} algorithmName="aaaa">
                        版本列表
                  </VersionListModalButton>
                );
            },
          },
        ]}
        pagination={setPageInfo ? {
          current: pageInfo.page,
          defaultPageSize: 10,
          pageSize: pageInfo.pageSize,
          showSizeChanger: true,
          // total: data?.count,
          total: 1,
          onChange: (page, pageSize) => setPageInfo({ page, pageSize }),
        } : false}
        scroll={{ x: true }}
      />
    </div>
  );
};


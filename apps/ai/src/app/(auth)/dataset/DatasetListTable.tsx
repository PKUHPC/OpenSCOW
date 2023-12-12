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

import { App, Button, Divider, Form, Input, Select, Table } from "antd";
import NextError from "next/error";
import { useState } from "react";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { trpc } from "src/utils/trpc";

interface Props {
  isPublic: boolean;
}

export const filterDatesetType = {
  ALL: "全部",
  IMAGE: "图像",
  TEXT: "文本",
  VIDEO: "视频",
  AUDIO: "音频",
  OTHERS: "其他",
};
type FilterKeys = keyof typeof filterDatesetType;

interface FilterForm {
  owner?: string | undefined,
  type?: FilterKeys | undefined,
  name?: string | undefined,
  description?: string | undefined,
}

interface PageInfo {
    page: number;
    pageSize?: number;
}

export const DatasetListTable: React.FC<Props> = ({ isPublic }) => {

  const [query, setQuery] = useState<FilterForm>(() => {
    return {
      // TODO check isPublic
      owner: undefined,
      name: undefined,
      description: undefined,
      type: undefined,
    };
  });

  const [form] = Form.useForm<FilterForm>();

  const [pageInfo, setPageInfo] = useState<PageInfo>({ page: 1, pageSize: 10 });

  const { data, isFetching, error, status } = trpc.dataset.list.useQuery({
    paginationSchema: pageInfo, filter: query,
  });


  const { message } = App.useApp();


  if (error) {
    return (
      <NextError
        title={error.message}
        statusCode={error.data?.httpStatus ?? 500}
      />
    );
  }

  // TODO
  // if (status !== "success") {
  //   message.error("找不到数据集");
  // }
  const setSelectedType = (value: any) => {
    console.log(value);
  };


  return (
    <div>
      <FilterFormContainer style={{ display: "flex", justifyContent: "space-between" }}>
        <Form<FilterForm>
          layout="inline"
          form={form}
          initialValues={query}
          onFinish={async () => {
            const { name, description } = await form.validateFields();
            setQuery({ ...query, name: name?.trim(), description: description?.trim() });
            setPageInfo({ page: 1, pageSize: pageInfo.pageSize });
          }}
        >
          <Form.Item label="数据类型" name="type">
            <Select
              style={{ minWidth: "100px" }}
              allowClear
              onChange={(value) => {
                setSelectedType(value);
              }}
              placeholder="请选择数据类型"
              defaultValue={filterDatesetType.ALL}
            >
              {Object.entries(filterDatesetType).map(([key, value]) => (
                <Select.Option key={key} value={value}>
                  {value}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="nameOrDesc">
            <Input allowClear placeholder="名称或描述" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">搜索</Button>
          </Form.Item>
        </Form>
      </FilterFormContainer>
      <Table
        rowKey="id"
        dataSource={data?.items}
        loading={isFetching}
        columns={[
          { dataIndex: "name", title: "名称" },
          { dataIndex: "type", title: "数据集类型" },
          { dataIndex: "description", title: "数据集描述" },
          { dataIndex: "scene", title: "应用场景" },
          { dataIndex: "versions", title: "版本数量",
            render: (_, r) => {
              return r.versions.length;
            } },
          isPublic ? { dataIndex: "shareUser", title: "分享者",
            render: (_, r) => {
              return r.owner;
            } } : {},
          { dataIndex: "createTime", title: "创建时间" },
          { dataIndex: "action", title: "操作",
            render: (_, r) => {
              // return r.resourceStatus === ResourceStatus.RESOURCE_ACTIVE ?
              //   (
              //     <Space split={<Divider type="vertical" />}>
              //       <a
              //         onClick={() => {
              //           modal.confirm({
              //             title: "确认操作",
              //             content: `是否确认关闭 ${r.resourceName}?`,
              //             onOk: () => {
              //               setInactiveMutation.mutate({
              //                 resourceId: r.resourceId,
              //               });
              //             },
              //           });
              //         }}
              //       >关闭</a>
              //       <UpdateResourceModalButton key='修改' refetch={refetch} resource={r}>修改</UpdateResourceModalButton>
              //     </Space>
              //   ) :
              //   (
              //     <Button
              //       type="primary"
              //       onClick={() => {
              //         modal.confirm({
              //           title: "确认操作",
              //           content: `是否确认开通 ${r.resourceName}?`,
              //           onOk: () => {
              //             setActiveMutation.mutate({
              //               resourceId: r.resourceId,
              //             });
              //           },
              //         });
              //       }}
              //     >开通</Button>
              //   );
            },
          },
        ]}
        pagination={setPageInfo ? {
          current: pageInfo.page,
          defaultPageSize: 10,
          pageSize: pageInfo.pageSize,
          showSizeChanger: true,
          total: data?.count,
          onChange: (page, pageSize) => setPageInfo({ page, pageSize }),
        } : false}
        scroll={{ x: true }}
      />
);
    </div>
  );
};


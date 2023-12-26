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

import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { I18nStringType } from "@scow/config/build/i18n";
import { App, Button, Col, Divider, Form, Input, InputNumber, Row, Select, Space, Spin } from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AccountSelector } from "src/components/AccountSelector";
import { FileSelectModal } from "src/components/FileSelectModal";
import { Cluster } from "src/utils/config";
import { formatSize } from "src/utils/format";
import { trpc } from "src/utils/trpc";

interface Props {
  appId?: string;
  appName?: string;
  appImage?: {
    name: string;
    tag: string;
  };
  appComment?: I18nStringType;
  clusterId: string;
  clusterInfo: ClusterConfig;
  isTraining?: boolean;
}

interface FormFields {
  appJobName: string;
  algorithm: any;
  image: any;
  dataset: any;
  workingDirectory: string;
  partition: string | undefined;
  qos: string | undefined;
  nodeCount: number;
  coreCount: number;
  gpuCount: number | undefined;
  account: string;
  maxTime: number;
}

interface ClusterConfig {
  partitions: Partition[];
  schedulerName: string,
}

interface Partition {
  name: string;
  memMb: number;
  cores: number;
  gpus: number;
  nodes: number;
  qos?: string[];
  comment?: string;
}


// 生成默认应用名称，命名规则为"当前应用名-年月日-时分秒"
const genAppJobName = (appName: string): string => {
  return `${appName}-${dayjs().format("YYYYMMDD-HHmmss")}`;
};

const initialValues = {
  nodeCount: 1,
  coreCount: 1,
  gpuCount: 1,
  maxTime: 60,
} as Partial<FormFields>;

const inputNumberFloorConfig = {
  formatter: (value: number | undefined) => `${Math.floor(value ?? 0)}`,
  parser: (value: string | undefined) => Math.floor(value ? +value : 0),
};


export const LaunchAppForm = (props: Props) => {

  const { clusterId, appName, clusterInfo, isTraining = false, appId, appImage } = props;

  const { message } = App.useApp();

  const router = useRouter();

  const [form] = Form.useForm<FormFields>();

  const [currentPartitionInfo, setCurrentPartitionInfo] = useState<Partition | undefined>();

  const isPublicDataset = Form.useWatch(["dataset", "type"], form) === "public";
  const isPublicAlgorithm = Form.useWatch(["algorithm", "type"], form) === "public";

  const selectedDataset = Form.useWatch(["dataset", "name"], form);

  const selectAlgorithm = Form.useWatch(["algorithm", "name"], form);

  const { data: datasets } = trpc.dataset.list.useQuery({
    isShared: isPublicDataset, clusterId,
  });

  const { data: datasetVersions } = trpc.dataset.versionList.useQuery({
    datasetId: selectedDataset, isShared: isPublicDataset,
  }, { enabled: selectedDataset !== undefined });

  const datasetOptions = useMemo(() => {
    return datasets?.items.map((x) => ({ label: x.name, value: x.id }));
  }, [datasets]);

  const datasetVersionOptions = useMemo(() => {
    return datasetVersions?.items.map((x) => ({ label: x.versionName, value: x.id }));
  }, [datasetVersions]);

  const { data: algorithms } = trpc.algorithm.getAlgorithms.useQuery(
    {
      clusterId,
      isPublic: isPublicAlgorithm,
    });

  const { data:algorithmVersions } =
  trpc.algorithm.getAlgorithmVersions.useQuery({ algorithmId: selectAlgorithm, isPublic: isPublicAlgorithm }, {
    enabled: selectAlgorithm !== undefined });


  const algorithmOptions = useMemo(() => {
    return algorithms?.items.map((x) => ({ label: x.name, value: x.id }));
  }, [datasets]);

  const algorithmVersionOptions = useMemo(() => {
    return algorithmVersions?.items.map((x) => ({ label: x.versionName, value: x.id }));
  }, [algorithmVersions]);

  const nodeCount = Form.useWatch("nodeCount", form) as number;

  const coreCount = Form.useWatch("coreCount", form) as number;

  const gpuCount = Form.useWatch("gpuCount", form) as number;

  const memorySize = (currentPartitionInfo ?
    currentPartitionInfo.gpus ? nodeCount * gpuCount
    * Math.floor(currentPartitionInfo.cores / currentPartitionInfo.gpus)
    * Math.floor(currentPartitionInfo.memMb / currentPartitionInfo.cores) :
      nodeCount * coreCount * Math.floor(currentPartitionInfo.memMb / currentPartitionInfo.cores) : 0);
  const memoryDisplay = formatSize(memorySize, ["MB", "GB", "TB"]);

  const coreCountSum = currentPartitionInfo?.gpus
    ? nodeCount * gpuCount * Math.floor(currentPartitionInfo.cores / currentPartitionInfo.gpus)
    : nodeCount * coreCount;


  const handlePartitionChange = (partition: string) => {
    const partitionInfo = clusterInfo
      ? clusterInfo.partitions.find((x) => x.name === partition)
      : undefined;
    form.setFieldValue("qos", partitionInfo?.qos?.[0]);
    if (!!partitionInfo?.gpus) {
      form.setFieldValue("gpuCount", 1);
    } else {
      form.setFieldValue("coreCount", 1);
    }
    setCurrentPartitionInfo(partitionInfo);

  };

  useEffect(() => {
    setCurrentPartitionInfo(clusterInfo?.partitions[0]);
    form.setFieldsValue({
      partition: clusterInfo?.partitions[0].name,
      qos: clusterInfo?.partitions[0].qos?.[0],
      appJobName: genAppJobName(appName ?? "trainJobs"),
    });
  }, [clusterInfo]);

  const createAppSessionMutation = trpc.jobs.createAppSession.useMutation({
    onSuccess() {
      message.success("创建成功");
      router.push(`/jobs/${clusterId}/runningJobs`);
    },
    onError(e) {
      message.error(`创建失败: ${e.message}`);
    },
  },
  );

  return (
    <Form
      form={form}
      initialValues={{
        ... initialValues,
      }}
      onFinish={(values) => {
        createAppSessionMutation.mutate({
          clusterId,
          appId: appId!,
          appJobName: values.appJobName,
          algorithm: values.algorithm.version,
          image: `${appImage!.name}:${appImage!.tag}`,
          dataset: values.dataset.version,
          account: values.account,
          partition: values.partition,
          qos: values.qos,
          nodeCount: values.nodeCount,
          coreCount: values.coreCount,
          gpuCount: values.gpuCount,
          maxTime: values.maxTime,
          workingDirectory: values.workingDirectory,
        });
      }}
    >
      <Spin spinning={createAppSessionMutation.isLoading} tip="loading">
        <Form.Item name="appJobName" label="应用名称" rules={[{ required: true }, { max: 50 }]}>
          <Input />
        </Form.Item>
        <Form.Item label="算法" required>
          <Space>
            <Form.Item name={["algorithm", "type"]} rules={[{ required: true }]} noStyle>
              <Select
                style={{ minWidth: 100 }}
                onChange={() => {
                  form.setFieldsValue({ algorithm: { name: undefined, version: undefined } });
                }}
                options={
                  [
                    {
                      value: "private",
                      label: "我的算法",
                    },
                    {
                      value: "public",
                      label: "公共算法",
                    },
                  ]
                }
              />
            </Form.Item>
            <Form.Item name={["algorithm", "name"]} rules={[{ required: true }]} noStyle>
              <Select style={{ minWidth: 100 }} options={algorithmOptions} />
            </Form.Item>
            <Form.Item name={["algorithm", "version"]} rules={[{ required: true }]} noStyle>
              <Select style={{ minWidth: 100 }} options={algorithmVersionOptions} />
            </Form.Item>
          </Space>
        </Form.Item>
        {isTraining && (
          <Form.Item label="镜像" required>
            <Space>
              <Form.Item name={["image", "type"]} rules={[{ required: true }]} noStyle>
                <Select style={{ minWidth: 100 }} />
              </Form.Item>
              <Form.Item name={["image", "name"]} rules={[{ required: true }]} noStyle>
                <Select style={{ minWidth: 100 }} />
              </Form.Item>
            </Space>
          </Form.Item>
        )}
        <Form.Item label="数据集" required>
          <Space>
            <Form.Item name={["dataset", "type"]} rules={[{ required: true }]} noStyle>
              <Select
                style={{ minWidth: 120 }}
                onChange={() => {
                  form.setFieldsValue({ dataset: { name: undefined, version: undefined } });
                }}
                options={
                  [
                    {
                      value: "private",
                      label: "我的数据集",
                    },
                    {
                      value: "public",
                      label: "公共数据集",
                    },

                  ]
                }
              />
            </Form.Item>
            <Form.Item name={["dataset", "name"]} rules={[{ required: true }]} noStyle>
              <Select
                style={{ minWidth: 100 }}
                onChange={() => {
                  form.setFieldValue(["dataset", "version"], undefined);
                }}
                options={datasetOptions}
              />
            </Form.Item>
            <Form.Item name={["dataset", "version"]} rules={[{ required: true }]} noStyle>
              <Select style={{ minWidth: 100 }} options={datasetVersionOptions} />
            </Form.Item>
          </Space>
        </Form.Item>
        <Form.Item name="workingDirectory" label="工作目录" required>
          <Input
            suffix={
              (
                <FileSelectModal
                  onSubmit={(path: string) => {
                    form.setFields([{ name: "workingDirectory", value: path, touched: true }]);
                    form.validateFields(["workingDirectory"]);
                  }}
                  cluster={{ id:"a", name:"sss" }}
                />
              )
            }
          />
        </Form.Item>
        <Divider orientation="left" orientationMargin="0" plain>资源</Divider>
        <Form.Item
          label="账户"
          name="account"
          rules={[{ required: true }]}
        >
          <AccountSelector cluster={clusterId} />
        </Form.Item>

        <Form.Item
          label="分区"
          name="partition"
          rules={[{ required: true }]}
        >
          <Select
            disabled={!currentPartitionInfo}
            options={clusterInfo
              ? clusterInfo.partitions.map((x) => ({ label: x.name, value: x.name }))
              : []
            }
            onChange={handlePartitionChange}
          />
        </Form.Item>
        <Form.Item
          label="qos"
          name="qos"
          rules={[{ required: true }]}
        >
          <Select />
        </Form.Item>
        <Form.Item
          label="节点数"
          name="nodeCount"
          dependencies={["partition"]}
          rules={[
            { required: true, type: "integer",
              max: currentPartitionInfo?.nodes,
            },
          ]}
        >
          <InputNumber
            min={1}
            max={currentPartitionInfo?.nodes}
            {...inputNumberFloorConfig}
          />
        </Form.Item>
        {
          currentPartitionInfo?.gpus ? (
            <Form.Item
              label="单节点GPU卡数"
              name="gpuCount"
              dependencies={["partition"]}
              rules={[
                {
                  required: true,
                  type: "integer",
                  max: currentPartitionInfo?.gpus / currentPartitionInfo.nodes,
                },
              ]}
            >
              <InputNumber
                min={1}
                max={currentPartitionInfo?.gpus / currentPartitionInfo.nodes}
                {...inputNumberFloorConfig}
              />
            </Form.Item>
          ) : (
            <Form.Item
              label="单节点CPU核心数"
              name="coreCount"
              dependencies={["partition"]}
              rules={[
                { required: true,
                  type: "integer",
                  max: currentPartitionInfo ?
                    currentPartitionInfo.cores / currentPartitionInfo.nodes : undefined },
              ]}
            >
              <InputNumber
                min={1}
                max={currentPartitionInfo ?
                  currentPartitionInfo.cores / currentPartitionInfo.nodes : undefined }
                {...inputNumberFloorConfig}
              />
            </Form.Item>
          )
        }
        <Form.Item label="最长运行时间" name="maxTime" rules={[{ required: true }]}>
          <InputNumber min={1} step={1} addonAfter="分钟" />
        </Form.Item>

        <Row>
          {
            currentPartitionInfo?.gpus
              ?
              (
                <Col span={12} sm={6}>
                  {/* <Form.Item label={t(p("totalGpuCount"))}> */}
                  <Form.Item label="总GPU数">
                    {nodeCount * gpuCount}
                  </Form.Item>
                </Col>
              ) : null
          }
          <Col span={12} sm={6}>
            <Form.Item label="总CPU数">
              {coreCountSum}
            </Form.Item>
          </Col>
          <Col span={12} sm={6}>
            <Form.Item label="总内存">
              {memoryDisplay}
            </Form.Item>
          </Col>
        </Row>
        {
          isTraining ? (
            <>
              <Divider orientation="left" orientationMargin="0" plain>运行设置</Divider>
              <Form.Item label="运行命令" name="command" rules={[{ required: true }]}>
                <Input.TextArea minLength={3} />
              </Form.Item>
              <Form.Item label="运行参数">
                <Form.List
                  name="keyValues"
                  initialValue={[{ key: "", value: "" }]} // 初始化一个空的键值对
                >
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }, index) => (
                        <Space key={key} style={{ display: "flex", marginBottom: 8 }} align="baseline">
                          <Form.Item
                            {...restField}
                            name={[name, "key"]}
                            rules={[{ required: true, message: "请输入键" }]}
                          >
                            <Input placeholder="键" />
                          </Form.Item>
                          <span style={{ lineHeight: "32px" }}>=</span>
                          <Form.Item
                            {...restField}
                            name={[name, "value"]}
                            rules={[{ required: true, message: "请输入值" }]}
                          >
                            <Input placeholder="值" />
                          </Form.Item>
                          {fields.length > 1 ? (
                            <MinusCircleOutlined onClick={() => remove(name)} />
                          ) : null}
                          {index === fields.length - 1 ? (
                            <PlusOutlined onClick={() => add()} />
                          ) : null}
                        </Space>
                      ))}
                    </>
                  )}
                </Form.List>
              </Form.Item>
            </>
          ) : null
        }
      </Spin>
      <Form.Item>
        <Button
          onClick={() => router.push(`/jobs/${clusterId}/createApps`)}
          style={{ marginRight: "10px" }}
        >
          取消
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          loading={createAppSessionMutation.isLoading}
        >
          提交
        </Button>
      </Form.Item>
    </Form>
  );
};

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

import { parsePlaceholder } from "@scow/lib-config/build/parse";
import { App, Button, Checkbox, Col, Form, Input, InputNumber, Row, Select } from "antd";
import dayjs from "dayjs";
import Router from "next/router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAsync } from "react-async";
import { useStore } from "simstate";
import { api } from "src/apis";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { CodeEditor } from "src/components/CodeEditor";
import { AccountSelector } from "src/pageComponents/job/AccountSelector";
import { FileSelectModal } from "src/pageComponents/job/FileSelectModal";
import { DefaultClusterStore } from "src/stores/DefaultClusterStore";
import { Cluster, publicConfig } from "src/utils/config";
import { formatSize } from "src/utils/format";

interface JobForm {
  cluster: Cluster;
  partition: string;
  nodeCount: number;
  coreCount: number;
  gpuCount: number | undefined;
  command: string;
  jobName: string;
  qos: string | undefined;
  maxTime: number;
  account: string;
  comment: string;
  workingDirectory: string;
  output: string;
  errorOutput: string;
  save: boolean;
}

// 生成默认工作名称，命名规则为年月日-时分秒，如job-20230510-103010
const genJobName = (): string => {
  return `job-${dayjs().format("YYYYMMDD-HHmmss")}`;
};

// 设置节点数，单节点核心数，单节点GPU卡数填入变化config
const inputNumberFloorConfig = {
  formatter: (value) => `${Math.floor(value)}`,
  parser: (value) => Math.floor(+value),
};

const initialValues = {
  command: "",
  nodeCount: 1,
  coreCount: 1,
  gpuCount: 1,
  maxTime: 30,
  output: "job.%j.out",
  errorOutput: "job.%j.err",
  save: false,
} as Partial<JobForm>;

interface Props {
  initial?: typeof initialValues;
}

export const SubmitJobForm: React.FC<Props> = ({ initial = initialValues }) => {
  const { message, modal } = App.useApp();

  const [form] = Form.useForm<JobForm>();
  const [loading, setLoading] = useState(false);



  const submit = async () => {
    const { cluster, command, jobName, coreCount, gpuCount, workingDirectory, output, errorOutput, save,
      maxTime, nodeCount, partition, qos, account, comment } = await form.validateFields();

    setLoading(true);

    await api.submitJob({ body: {
      cluster: cluster.id, command, jobName, account,
      coreCount: gpuCount ? gpuCount * Math.floor(currentPartitionInfo!.cores / currentPartitionInfo!.gpus) : coreCount,
      gpuCount,
      maxTime, nodeCount, partition, qos, comment,
      workingDirectory, save, memory, output, errorOutput,
    } })
      .httpError(500, (e) => {
        if (e.code === "SCHEDULER_FAILED") {
          modal.error({
            title: "提交作业失败",
            content: e.message,
          });
        } else {
          throw e;
        }
      })
      .then(({ jobId }) => {
        message.success("提交成功！您的新作业ID为：" + jobId);
        Router.push("/jobs/runningJobs");
      })
      .finally(() => setLoading(false));
  };

  const cluster = Form.useWatch("cluster", form) as Cluster | undefined;

  const jobName = Form.useWatch("jobName", form) as string;

  const partition = Form.useWatch("partition", form) as string;

  const nodeCount = Form.useWatch("nodeCount", form) as number;

  const coreCount = Form.useWatch("coreCount", form) as number;

  const gpuCount = Form.useWatch("gpuCount", form) as number;

  const calculateWorkingDirectory = (template: string) =>
    parsePlaceholder(template, { name: jobName });

  const clusterInfoQuery = useAsync({
    promiseFn: useCallback(async () => cluster
      ? api.getClusterInfo({ query: { cluster:  cluster?.id } }) : undefined, [cluster]),
    onResolve: (data) => {
      if (data) {
        // 如果是从模板导入，则判断当前选中的分区中是否仍有模板中的partition，若有，则将默认值设为模板值；
        const setValueFromTemplate = initial.partition &&
          data.clusterInfo.slurm.partitions.some((item) => { return item.name === initial.partition; });
        const partition = data.clusterInfo.slurm.partitions[0];
        const setInitialValues = setValueFromTemplate ? {
          partition: initial.partition,
          qos: initial.qos,
        } : {
          partition: partition.name,
          qos: partition.qos?.[0],
        };
        form.setFieldsValue(setInitialValues);
      }

      const jobInitialName = genJobName();
      form.setFieldValue("jobName", jobInitialName);
      setWorkingDirectoryValue();

    },
  });

  const setWorkingDirectoryValue = () => {
    if (!form.isFieldTouched("workingDirectory") && clusterInfoQuery.data) {
      form.setFieldValue("workingDirectory",
        calculateWorkingDirectory(clusterInfoQuery.data.clusterInfo.submitJobDirTemplate));
    }
  };

  useEffect(() => {
    setWorkingDirectoryValue();
  }, [jobName, clusterInfoQuery.data]);

  const currentPartitionInfo = useMemo(() =>
    clusterInfoQuery.data
      ? clusterInfoQuery.data.clusterInfo.slurm.partitions.find((x) => x.name === partition)
      : undefined,
  [clusterInfoQuery.data, partition],
  );

  useEffect(() => {
    if (currentPartitionInfo) {
      // 如果是从模板导入，则判断当前选中的分区中是否仍有模板中的qos，若有，则将默认值设为模板值；
      const setValueFromTemplate = initial.partition && currentPartitionInfo.qos?.some((i) => i === initial.qos);
      form.setFieldValue("qos", setValueFromTemplate ? initial.qos : currentPartitionInfo.qos?.[0]);
    }
  }, [currentPartitionInfo]);

  const defaultClusterStore = useStore(DefaultClusterStore);
  // 判断是使用template中的cluster还是系统默认cluster，防止系统配置文件更改时仍选改动前的cluster
  const defaultCluster = publicConfig.CLUSTERS.find((x) => x.id === initial.cluster?.id) ?? defaultClusterStore.cluster;

  const memorySize = (currentPartitionInfo ?
    currentPartitionInfo.gpus ? nodeCount * gpuCount
    * Math.floor(currentPartitionInfo.cores / currentPartitionInfo.gpus)
    * Math.floor(currentPartitionInfo.mem / currentPartitionInfo.cores) :
      nodeCount * coreCount * Math.floor(currentPartitionInfo.mem / currentPartitionInfo.cores) : 0);
  const memory = memorySize + "MB";
  const memoryDisplay = formatSize({ size: memorySize, unitMap: ["MB", "GB", "TB"]});

  const coreCountSum = currentPartitionInfo?.gpus
    ? nodeCount * gpuCount * Math.floor(currentPartitionInfo.cores / currentPartitionInfo.gpus)
    : nodeCount * coreCount;

  return (
    <Form<JobForm>
      form={form}
      initialValues={{
        ...initial,
        cluster: defaultCluster,
      }}
      onFinish={submit}
    >
      <Row gutter={4}>
        <Col span={24} sm={12}>
          <Form.Item<JobForm> label="集群" name="cluster" rules={[{ required: true }]}>
            <SingleClusterSelector />
          </Form.Item>
        </Col>
        <Col span={24} sm={12}>
          <Form.Item<JobForm> label="作业名" name="jobName" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item<JobForm>
        label="命令"
        name="command"
        rules={[{ required: true }]}
      >
        <CodeEditor
          height="50vh"
          placeholder="#此处参数设置的优先级高于页面其它地方，两者冲突时以此处为准"
        />
      </Form.Item>
      <Row gutter={4}>
        <Col span={24} sm={12}>
          <Form.Item
            label="账户"
            name="account"
            rules={[{ required: true }]}
            dependencies={["cluster"]}
          >
            {/* 加载完集群后再加载账户，保证initial值能被赋值成功 */}
            {cluster?.id && <AccountSelector cluster={cluster.id} />}
          </Form.Item>
        </Col>
        <Col span={24} sm={6}>
          <Form.Item
            label="分区"
            name="partition"
            dependencies={["cluster"]}
            rules={[{ required: true }]}
          >
            <Select
              loading={clusterInfoQuery.isLoading}
              disabled={!currentPartitionInfo}
              options={clusterInfoQuery.data
                ? clusterInfoQuery.data.clusterInfo.slurm.partitions
                  .map((x) => ({ label: x.name, value: x.name }))
                : []
              }
            />
          </Form.Item>
        </Col>
        <Col span={24} sm={6}>
          <Form.Item
            label="QOS"
            name="qos"
            dependencies={["cluster", "partition"]}
            rules={[{ required: true }]}
          >
            <Select
              disabled={(!currentPartitionInfo?.qos) || currentPartitionInfo.qos.length === 0}
              options={currentPartitionInfo?.qos?.map((x) => ({ label: x, value: x }))}
            />
          </Form.Item>
        </Col>
        <Col span={12} sm={6}>
          <Form.Item
            label="节点数"
            name="nodeCount"
            dependencies={["cluster", "partition"]}
            rules={[
              { required: true, type: "integer", max: currentPartitionInfo?.nodes },
            ]}
          >
            <InputNumber
              min={1}
              max={currentPartitionInfo?.nodes}
              {...inputNumberFloorConfig}
            />
          </Form.Item>
        </Col>
        <Col span={12} sm={6}>
          {currentPartitionInfo?.gpus ? (
            <Form.Item
              label="单节点GPU卡数"
              name="gpuCount"
              dependencies={["cluster", "partition"]}
              rules={[
                {
                  required: true,
                  type: "integer",
                  max: currentPartitionInfo?.gpus,
                },
              ]}
            >
              <InputNumber
                min={1}
                max={currentPartitionInfo?.gpus}
                {...inputNumberFloorConfig}
              />
            </Form.Item>
          ) : (
            <Form.Item
              label="单节点核心数"
              name="coreCount"
              dependencies={["cluster", "partition"]}
              rules={[
                {
                  required: true,
                  type: "integer",
                  max: currentPartitionInfo?.cores,
                },
              ]}
            >
              <InputNumber
                min={1}
                max={currentPartitionInfo?.cores}
                {...inputNumberFloorConfig}
              />
            </Form.Item>
          )}
        </Col>
        <Col span={24} sm={12}>
          <Form.Item label="最长运行时间" name="maxTime" rules={[{ required: true }]}>
            <InputNumber min={1} step={1} addonAfter={"分钟"} />
          </Form.Item>
        </Col>
        <Col span={24} sm={10}>
          <Form.Item<JobForm> label="工作目录" name="workingDirectory" rules={[{ required: true }]}>
            <Input
              addonBefore="~/"
              suffix={
                (
                  <FileSelectModal
                    onSubmit={(path: string) => {
                      form.setFieldValue("workingDirectory", path);
                      form.validateFields(["workingDirectory"]);
                    }}
                    cluster={cluster || defaultCluster}
                  />
                )
              }
            />
          </Form.Item>
        </Col>
        <Col span={24} sm={7}>
          <Form.Item<JobForm> label="标准输出文件" name="output" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={24} sm={7}>
          <Form.Item<JobForm> label="错误输出文件" name="errorOutput" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col className="ant-form-item" span={12} sm={6}>
          总节点数：{nodeCount}
        </Col>

        {currentPartitionInfo?.gpus ? (
          <Col className="ant-form-item" span={12} sm={6}>
            总GPU卡数：{nodeCount * gpuCount}
          </Col>
        ) : (
          ""
        )}

        <Col className="ant-form-item" span={12} sm={6}>
          总CPU核心数：{coreCountSum}
        </Col>
        <Col className="ant-form-item" span={12} sm={6}>
          总内存容量：{memoryDisplay}
        </Col>
      </Row>
      <Form.Item label="备注" name="comment">
        <Input.TextArea />
      </Form.Item>
      <Form.Item name="save" valuePropName="checked">
        <Checkbox>保存为模板</Checkbox>
      </Form.Item>
      <Button type="primary" htmlType="submit" loading={loading}>
          提交
      </Button>
    </Form>
  );
};

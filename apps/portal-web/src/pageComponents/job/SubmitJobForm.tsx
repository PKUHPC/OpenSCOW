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
import { join } from "path";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAsync } from "react-async";
import { useStore } from "simstate";
import { api } from "src/apis";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { CodeEditor } from "src/components/CodeEditor";
import { ClusterNotAvailablePage } from "src/components/errorPages/ClusterNotAvailablePage";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { AccountSelector } from "src/pageComponents/job/AccountSelector";
import { FileSelectModal } from "src/pageComponents/job/FileSelectModal";
import { ClusterInfoStore } from "src/stores/ClusterInfoStore";
import { Cluster } from "src/utils/cluster";
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
  maxTimeValue: number;
  maxTimeUnit: "minutes" | "hours";
  account: string;
  comment: string;
  workingDirectory: string;
  output: string;
  scriptOutput: string;
  errorOutput: string;
  save: boolean;
  showScriptOutput: boolean;
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
  maxTimeValue: 30,
  maxTimeUnit:"minutes",
  output: "job.%j.out",
  scriptOutput:"job.%j.sh",
  errorOutput: "job.%j.err",
  save: false,
  showScriptOutput:true,
} as Partial<JobForm>;

interface Props {
  initial?: typeof initialValues;
  submitJobPromptText: string;
}

const p = prefix("pageComp.job.submitJobForm.");

export const SubmitJobForm: React.FC<Props> = ({ initial = initialValues, submitJobPromptText }) => {
  const { message, modal } = App.useApp();

  const [form] = Form.useForm<JobForm>();
  const [loading, setLoading] = useState(false);
  const t = useI18nTranslateToString();


  const cluster = Form.useWatch("cluster", form) as Cluster | undefined;

  const submit = async () => {
    const formValues = await form.validateFields();
    const { cluster, command, jobName, coreCount, gpuCount, workingDirectory, output, errorOutput, save,
      maxTimeValue, maxTimeUnit, nodeCount, partition, qos, account, comment, showScriptOutput } = formValues;
    const scriptOutput = showScriptOutput ? formValues.scriptOutput : "";
    const maxTime = maxTimeUnit === "hours" ? maxTimeValue * 60 : maxTimeValue;
    await api.submitJob({ body: {
      cluster: cluster.id, command, jobName, account,
      coreCount: gpuCount ? gpuCount * Math.floor(currentPartitionInfo!.cores / currentPartitionInfo!.gpus) : coreCount,
      gpuCount,
      maxTime, nodeCount, partition, qos, comment,
      workingDirectory, save, memory, output, errorOutput, scriptOutput,
    } })
      .httpError(500, (e) => {
        if (e.code === "SCHEDULER_FAILED") {
          modal.error({
            title: t(p("errorMessage")),
            content: e.message,
          });
        } else {
          throw e;
        }
      })
      .then(({ jobId }) => {
        message.success(t(p("successMessage")) + jobId);
        Router.push("/jobs/runningJobs");
      })
      .finally(() => setLoading(false));
  };


  const jobName = Form.useWatch("jobName", form) as string;

  const partition = Form.useWatch("partition", form) as string;

  const nodeCount = Form.useWatch("nodeCount", form) as number;

  const coreCount = Form.useWatch("coreCount", form) as number;

  const gpuCount = Form.useWatch("gpuCount", form) as number;

  const showScriptOutput = Form.useWatch("showScriptOutput", form) as boolean;

  const calculateWorkingDirectory = (template: string, homePath: string = "") =>
    join(homePath + "/", parsePlaceholder(template, { name: jobName }));

  const calculateScriptOutput = () => {
    const parseName = parsePlaceholder("{{ name }}", { name: jobName }).trim();
    return parseName ? parseName + ".sh" : "";
  };

  const clusterInfoQuery = useAsync({
    promiseFn: useCallback(async () => cluster
      ? api.getClusterInfo({ query: { cluster:  cluster?.id } })
      : undefined, [cluster]),
    onResolve: (data) => {
      if (data) {
        // 如果是从模板导入，则判断当前选中的分区中是否仍有模板中的partition，若有，则将默认值设为模板值；
        const setValueFromTemplate = initial.partition &&
          data.clusterInfo.scheduler.partitions.some((item) => { return item.name === initial.partition; });
        const partition = data.clusterInfo.scheduler.partitions[0];
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
    },
  });

  const { data: homePath, isLoading: isHomePathLoading } = useAsync({
    promiseFn: useCallback(async () => cluster
      ? api.getHomeDirectory({ query: { cluster: cluster.id } }) : { path: "" }, [cluster?.id]),
  });

  const setWorkingDirectoryValue = () => {
    if (!form.isFieldTouched("workingDirectory") && clusterInfoQuery.data) {
      form.setFieldValue("workingDirectory",
        calculateWorkingDirectory(clusterInfoQuery.data.clusterInfo.submitJobDirTemplate, homePath?.path));
    }
  };
  const setScriptOutputValue = () => {
    form.setFieldValue("scriptOutput",
      calculateScriptOutput());
  };

  useEffect(() => {
    setScriptOutputValue();
  }, [jobName]);

  useEffect(() => {
    setWorkingDirectoryValue();
  }, [jobName, clusterInfoQuery.data, homePath?.path]);

  const currentPartitionInfo = useMemo(() =>
    clusterInfoQuery.data
      ? clusterInfoQuery.data.clusterInfo.scheduler.partitions.find((x) => x.name === partition)
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

  const { currentClusters, defaultCluster } = useStore(ClusterInfoStore);

  // 没有可用集群的情况不再渲染
  if (!defaultCluster && currentClusters.length === 0) {
    return <ClusterNotAvailablePage />;
  }

  // 判断是使用template中的cluster还是系统默认cluster，防止系统配置文件更改时仍选改动前的cluster
  const currentQueryCluster = currentClusters.find((x) => x.id === initial.cluster?.id) ??
    (defaultCluster ?? currentClusters[0]);

  const memorySize = (currentPartitionInfo ?
    currentPartitionInfo.gpus ? nodeCount * gpuCount
    * Math.floor(currentPartitionInfo.cores / currentPartitionInfo.gpus)
    * Math.floor(currentPartitionInfo.memMb / currentPartitionInfo.cores) :
      nodeCount * coreCount * Math.floor(currentPartitionInfo.memMb / currentPartitionInfo.cores) : 0);
  const memory = memorySize + "MB";
  const memoryDisplay = formatSize(memorySize, ["MB", "GB", "TB"]);

  const coreCountSum = currentPartitionInfo?.gpus
    ? nodeCount * gpuCount * Math.floor(currentPartitionInfo.cores / currentPartitionInfo.gpus)
    : nodeCount * coreCount;

  return (
    <Form<JobForm>
      form={form}
      initialValues={{
        ...initial,
        cluster: currentQueryCluster,
      }}
      onFinish={submit}
    >
      <Row gutter={4}>
        <Col span={24} sm={12}>
          <Form.Item<JobForm> label={t(p("cluster"))} name="cluster" rules={[{ required: true }]}>
            <SingleClusterSelector />
          </Form.Item>
        </Col>
        <Col span={24} sm={12}>
          <Form.Item<JobForm> label={t(p("jobName"))} name="jobName" rules={[{ required: true }, { max: 50 }]}>
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item<JobForm>
        label={t(p("command"))}
        name="command"
        rules={[{ required: true }]}
      >
        <CodeEditor
          height="50vh"
          placeholder={submitJobPromptText}
        />
      </Form.Item>
      <Row gutter={4}>
        <Col span={24} sm={12}>
          <Form.Item
            label={t(p("account"))}
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
            label={t(p("partition"))}
            name="partition"
            dependencies={["cluster"]}
            rules={[{ required: true }]}
          >
            <Select
              loading={clusterInfoQuery.isLoading}
              disabled={!currentPartitionInfo}
              options={clusterInfoQuery.data
                ? clusterInfoQuery.data.clusterInfo.scheduler.partitions
                  .map((x) => ({ label: x.name, value: x.name }))
                : []
              }
            />
          </Form.Item>
        </Col>
        <Col span={24} sm={6}>
          <Form.Item
            label={t(p("qos"))}
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
            label={t(p("nodeCount"))}
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
              label={t(p("gpuCount"))}
              name="gpuCount"
              dependencies={["cluster", "partition"]}
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
              label={t(p("coreCount"))}
              name="coreCount"
              dependencies={["cluster", "partition"]}
              rules={[
                {
                  required: true,
                  type: "integer",
                  max: currentPartitionInfo ? currentPartitionInfo.cores / currentPartitionInfo.nodes : undefined,
                },
              ]}
            >
              <InputNumber
                min={1}
                max={currentPartitionInfo ? currentPartitionInfo.cores / currentPartitionInfo.nodes : undefined}
                {...inputNumberFloorConfig}
              />
            </Form.Item>
          )}
        </Col>
        <Col span={24} sm={6}>
          <Form.Item label={t(p("maxTime"))} required>
            <Input.Group compact style={{ display: "flex", minWidth: "120px" }}>
              <Form.Item name="maxTimeValue" rules={[{ required: true }]} noStyle>
                <InputNumber
                  min={1}
                  step={1}
                  precision={0}
                  formatter={(value) => value?.toString() ?? ""}
                  parser={(value) => {
                    const parsedValue = value ? value.replace(/[^\d]/g, "") : "";
                    return parsedValue ? Number(parsedValue) as unknown as 1 : 0 as unknown as 1;
                  }}
                  style={{ flex: "1 0 80px" }}
                />
              </Form.Item>
              <Form.Item name="maxTimeUnit" rules={[{ required: true }]} noStyle>
                <Select
                  popupMatchSelectWidth={false}
                  style={{ flex: "0 1 auto" }}
                >
                  <Select.Option value="minutes">{t(p("minute"))}</Select.Option>
                  <Select.Option value="hours">{t(p("hours"))}</Select.Option>
                </Select>
              </Form.Item>
            </Input.Group>

          </Form.Item>
        </Col>
        <Col span={24} sm={12}>
          <Form.Item<JobForm>
            label={t(p("workingDirectory"))}
            name="workingDirectory"
            rules={[{ required: true }]}
            tooltip={(
              <>
                <span>{t(p("wdTooltip1"))}</span>
                <br />
                <span>{t(p("wdTooltip2"))}</span>
              </>
            )}
          >
            <Input
              suffix={
                (
                  <FileSelectModal
                    onSubmit={(path: string) => {
                      form.setFields([{ name: "workingDirectory", value: path, touched: true }]);
                      form.validateFields(["workingDirectory"]);
                    }}
                    cluster={cluster || currentQueryCluster}
                  />
                )
              }
            />
          </Form.Item>
        </Col>
        <Col span={24} sm={6}>
          <Form.Item<JobForm> label={t(p("output"))} name="output" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={24} sm={6}>
          <Form.Item<JobForm> label={t(p("errorOutput"))} name="errorOutput" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col className="ant-form-item" span={12} sm={6}>
          {t(p("totalNodeCount"))}{nodeCount}
        </Col>
        {currentPartitionInfo?.gpus ? (
          <Col className="ant-form-item" span={12} sm={6}>
            {t(p("totalGpuCount"))}{nodeCount * gpuCount}
          </Col>
        ) : (
          ""
        )}

        <Col className="ant-form-item" span={12} sm={6}>
          {t(p("totalCoreCount"))}{coreCountSum}
        </Col>
        <Col className="ant-form-item" span={12} sm={6}>
          {t(p("totalMemory"))}{memoryDisplay}
        </Col>
      </Row>
      <Form.Item label={t(p("comment"))} name="comment">
        <Input.TextArea />
      </Form.Item>
      <Row gutter={16}>
        <Col span={12} sm={3}>
          <Form.Item name="save" valuePropName="checked">
            <Checkbox>{t(p("saveToTemplate"))}</Checkbox>
          </Form.Item>
        </Col>
        <Form.Item name="showScriptOutput" valuePropName="checked">
          <Checkbox />
        </Form.Item>
        <Col span={12} sm={6}>
          <Form.Item<JobForm>
            label={t(p("saveJobSubmissionFile"))}
            name="scriptOutput"
            tooltip={(
              <>
                <span>{t(p("wdTooltip1"))}</span>
                <br />
                <span>{t(p("wdTooltip3"))}</span>
              </>
            )}
          >
            <Input
              style={{ visibility: showScriptOutput ? "visible" : "hidden" }}
            />
          </Form.Item>
        </Col>
      </Row>
      <Button type="primary" htmlType="submit" loading={loading || isHomePathLoading}>
        {t("button.submitButton")}
      </Button>
    </Form>
  );
};

import { ReloadOutlined } from "@ant-design/icons";
import { parsePlaceholder } from "@scow/lib-config/build/parse";
import { Button, Checkbox, Col, Form, Input, InputNumber, message, Modal, Row, Select, Tooltip } from "antd";
import { useWatch } from "antd/lib/form/Form";
import Router from "next/router";
import randomWords from "random-words";
import React, { useEffect, useMemo, useState } from "react";
import { api } from "src/apis";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { CodeEditor } from "src/components/CodeEditor";
import { InputGroupFormItem } from "src/components/InputGroupFormItem";
import { AccountSelector } from "src/pageComponents/job/AccountSelector";
import { Cluster, publicConfig } from "src/utils/config";
import { firstPartition, getPartitionInfo } from "src/utils/jobForm";

interface JobForm {
  cluster: Cluster;
  partition: string | undefined;
  nodeCount: number;
  coreCount: number;
  command: string;
  jobName: string;
  qos: string | undefined;
  maxTime: number;
  account: string;
  comment: string;
  workingDirectory: string;
  save: boolean;
}

function genJobName() {
  return randomWords({ exactly: 2, join: "-" });
}

const initialValues = {
  command: "",
  nodeCount: 1,
  coreCount: 1,
  maxTime: 30,
  save: false,
} as JobForm;

interface Props {
  initial?: typeof initialValues;
}

export const SubmitJobForm: React.FC<Props> = ({ initial = initialValues }) => {

  const [form] = Form.useForm<JobForm>();
  const [loading, setLoading] = useState(false);

  const reloadJobName = () => {
    form.setFieldsValue({ jobName: genJobName() });
  };

  const submit = async () => {
    const { cluster, command, jobName, coreCount, workingDirectory, save,
      maxTime, nodeCount, partition, qos, account, comment } = await form.validateFields();

    setLoading(true);

    await api.submitJob({ body: {
      cluster: cluster.id, command, jobName, account,
      coreCount, maxTime, nodeCount, partition, qos, comment,
      workingDirectory, save,
    } })
      .httpError(409, (e) => {
        const { code, message: serverMessage } = e;
        if (code === "SBATCH_FAILED") {
          Modal.error({
            title: "提交作业失败",
            content: serverMessage,
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

  const cluster = useWatch("cluster", form) as Cluster | undefined;

  const partition = useWatch("partition", form) as string | undefined;

  // set default
  useEffect(() => {
    const defaultCluster = publicConfig.CLUSTERS[0];

    if (defaultCluster) {
      const [partition, info] = firstPartition(defaultCluster);
      form.setFieldsValue({
        cluster: defaultCluster,
        partition,
        qos: info?.qos?.[0],
      });
    }
  }, []);

  // if partition is no longer available, use the first partition of the cluster
  useEffect(() => {

    if (!cluster) {
      form.setFieldsValue({ partition: undefined });
      return;
    }

    if (!getPartitionInfo(cluster, partition)) {
      form.setFieldsValue({ partition: firstPartition(cluster)[0] });
    }

  }, [cluster, partition]);

  const currentPartitionInfo = useMemo(
    () => cluster ? getPartitionInfo(cluster, partition) : undefined,
    [cluster, partition],
  );

  const initialJobNameAndDir = useMemo(() => {
    const jobName = genJobName();
    return { jobName, workingDirectory: parsePlaceholder(publicConfig.SUBMIT_JOB_WORKING_DIR, { name: jobName }) };
  }, []);

  return (
    <Form<JobForm>
      form={form}
      initialValues={{
        ...initial,
        ...initialJobNameAndDir,
      }}
      onFinish={submit}
      onValuesChange={(changed) => {
        if (changed.cluster) {
          const [name, info] = firstPartition(changed.cluster);
          form.setFieldsValue({ cluster: changed.cluster, partition: name, qos: info?.qos?.[0] });
        } else if (cluster && changed.partition) {
          const partitionInfo = getPartitionInfo(cluster, changed.partition);
          form.setFieldsValue({ qos: partitionInfo?.qos?.[0] });
        }
      }}
    >
      <Row gutter={4}>
        <Col span={24} sm={12}>
          <Form.Item<JobForm> label="集群" name="cluster" rules={[{ required: true }]}>
            <SingleClusterSelector />
          </Form.Item>
        </Col>
        <Col span={24} sm={12}>
          <Form.Item<JobForm> label="作业名" name="jobName" rules={[{ required: true }]}>
            <InputGroupFormItem deltaWidth="32px">
              <Tooltip title="重新生成作业名">
                <Button icon={<ReloadOutlined />} onClick={reloadJobName} />
              </Tooltip>
            </InputGroupFormItem>
          </Form.Item>
        </Col>
      </Row>
      <Form.Item<JobForm> label="命令" name="command" rules={[{ required: true }]}>
        <CodeEditor height="50vh" />
      </Form.Item>
      <Row gutter={4}>
        <Col span={24} sm={12}>
          <Form.Item
            label="账户"
            name="account"
            rules={[{ required: true }]}
            dependencies={["cluster"]}
          >
            <AccountSelector cluster={cluster?.id} />
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
              disabled={!currentPartitionInfo}
              options={cluster
                ? Object.keys(publicConfig.CLUSTERS_CONFIG[cluster.id].slurm.partitions)
                  .map((x) => ({ label: x, value: x }))
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
            <InputNumber min={1} />
          </Form.Item>
        </Col>
        <Col span={12} sm={6}>
          <Form.Item
            label="CPU核心数"
            name="coreCount"
            dependencies={["cluster", "partition"]}
            rules={[
              { required: true, type: "integer", max: currentPartitionInfo?.cores },
            ]}
          >
            <InputNumber min={1} />
          </Form.Item>
        </Col>
        <Col span={24} sm={12}>
          <Form.Item label="最长运行时间" name="maxTime" rules={[{ required: true }]}>
            <InputNumber min={1} step={1} addonAfter={"分钟"} />
          </Form.Item>
        </Col>
        <Col span={24} sm={24}>
          <Form.Item<JobForm> label="工作目录" name="workingDirectory" rules={[{ required: true }]}>
            <Input addonBefore="~/" />
          </Form.Item>
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

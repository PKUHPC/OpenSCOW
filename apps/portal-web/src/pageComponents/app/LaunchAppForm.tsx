import { App } from "@scow/config/build/appConfig/app";
import { Button, Form, InputNumber, message, Select } from "antd";
import { useEffect, useMemo, useState } from "react";
import { api } from "src/apis";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { AccountSelector } from "src/pageComponents/job/AccountSelector";
import { Cluster, publicConfig } from "src/utils/config";
import { defaultCluster, defaultPartitionInfo,
  defaultPartitionName, firstPartition, getPartitionInfo } from "src/utils/jobForm";

interface Props {
  config: App;
}

interface FormFields {
  cluster: Cluster;
  partition: string | undefined;
  qos: string | undefined;
  coreCount: number;
  account: string;
  maxTime: number;
}


const initialValues = {
  cluster: defaultCluster,
  partition: defaultPartitionName,
  nodeCount: 1,
  coreCount: 1,
  qos: defaultPartitionInfo?.qos?.[0],
  maxTime: 60,
} as Omit<FormFields, "account">;


export const LaunchAppForm: React.FC<Props> = ({ config }) => {

  const [form] = Form.useForm<FormFields>();
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const { cluster, coreCount, partition, qos, account, maxTime } = await form.validateFields();

    setLoading(true);
    await api.createAppSession({ body: {
      cluster: cluster.id,
      appId: config.id,
      coreCount,
      partition,
      qos,
      account,
      maxTime,
    } })
      .then(() => {
        message.success("创建成功！");
      }).finally(() => {
        setLoading(false);
      });
  };

  const cluster = Form.useWatch("cluster", form) ?? initialValues.cluster;

  const partition = Form.useWatch("partition", form) ?? initialValues.partition;

  // if partition is no longer available, use the first partition of the cluster
  useEffect(() => {
    if (!getPartitionInfo(cluster, partition)) {
      form.setFieldsValue({ partition: firstPartition(cluster)[0] });
    }
  }, [partition]);

  const currentPartitionInfo = useMemo(() => getPartitionInfo(cluster, partition), [cluster, partition]);

  return (
    <Form form={form} onFinish={onSubmit} initialValues={initialValues}>

      <Form.Item name="cluster" label="集群" rules={[{ required: true }]}>
        <SingleClusterSelector />
      </Form.Item>

      <Form.Item label="账户" name="account"
        rules={[{ required: true }]} dependencies={["cluster"]}
      >
        <AccountSelector cluster={cluster.id} />
      </Form.Item>

      <Form.Item<FormFields> label="分区" name="partition"
        dependencies={["cluster"]}
        rules={[{ required: true }]}
      >
        <Select
          disabled={!currentPartitionInfo}
          options={Object.keys(publicConfig.CLUSTERS_CONFIG[cluster.id].partitions)
            .map((x) => ({ label: x, value: x }))}
        />
      </Form.Item>

      <Form.Item<FormFields> label="QOS" name="qos"
        dependencies={["cluster", "partition"]}
        rules={[{ required: true }]}
      >
        <Select
          disabled={(!currentPartitionInfo?.qos) || currentPartitionInfo.qos.length === 0}
          options={currentPartitionInfo?.qos?.map((x) => ({ label: x, value: x }))}
        />
      </Form.Item>

      <Form.Item<FormFields> label="CPU核心数" name="coreCount"
        dependencies={["cluster", "partition"]}
        rules={[
          { required: true, type: "integer", max: currentPartitionInfo?.cores },
        ]}
      >
        <InputNumber min={1} />
      </Form.Item>

      <Form.Item label="最长运行时间" name="maxTime" rules={[{ required: true }]}>
        <InputNumber min={1} step={1} addonAfter={"分钟"} />
      </Form.Item>



      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          提交
        </Button>
      </Form.Item>
    </Form>
  );
};

import { Button, Form, Input, InputNumber, message, Select } from "antd";
import Router from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { AccountSelector } from "src/pageComponents/job/AccountSelector";
import { Cluster, publicConfig } from "src/utils/config";
import { firstPartition, getPartitionInfo } from "src/utils/jobForm";

interface Props {
  appId: string;
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
  nodeCount: 1,
  coreCount: 1,
  maxTime: 60,
} as Partial<FormFields>;


export const LaunchAppForm: React.FC<Props> = ({ appId }) => {

  const [form] = Form.useForm<FormFields>();
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const { cluster, coreCount, partition, qos, account, maxTime } = await form.validateFields();

    setLoading(true);
    await api.createAppSession({ body: {
      cluster: cluster.id,
      appId,
      coreCount,
      partition,
      qos,
      account,
      maxTime,
    } })
      .then(() => {
        message.success("创建成功！");
        Router.push("/apps/sessions");
      }).finally(() => {
        setLoading(false);
      });
  };


  const { data } = useAsync({
    promiseFn: useCallback(async () => {
      const { appCustomFormAttributes } = await api.getAppAttributes({ query: { appId } });
      return appCustomFormAttributes;
    },
    [appId]),
  });

  const cluster = Form.useWatch("cluster", form) as Cluster | undefined;
  const partition = Form.useWatch("partition", form) as string | undefined;

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

  const items = data?.map((item) => {
    if (item.widget === "number_field") {
      return (
        <Form.Item
          key={item.label}
          label={item.label}
          name="testNumberInput"
          rules={[
            { required: true, type: "integer" },
          ]}
        >
          <InputNumber />
        </Form.Item>
      );
    } else if (item.widget === "text_field") {
      return (
        <Form.Item
          key={item.label}
          label={item.label}
          name="testParameter"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
      );
    } else {
      const { Option } = Select;
      return (
        <Form.Item
          key={item.label}
          label="选项"
          name="testSelect"
          rules={[{ required: true }]}
        >
          <Select>
            <Option value="opt1">male</Option>
            <Option value="opt2">female</Option>
            <Option value="opt3">other</Option>
          </Select>

        </Form.Item>
      );
    }
  });

  return (
    <Form form={form} onFinish={onSubmit} initialValues={initialValues}>

      <Form.Item name="cluster" label="集群" rules={[{ required: true }]}>
        <SingleClusterSelector />
      </Form.Item>

      <Form.Item
        label="账户"
        name="account"
        rules={[{ required: true }]}
        dependencies={["cluster"]}
      >
        <AccountSelector cluster={cluster?.id} />
      </Form.Item>

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

      <Form.Item label="最长运行时间" name="maxTime" rules={[{ required: true }]}>
        <InputNumber min={1} step={1} addonAfter={"分钟"} />
      </Form.Item>

      {items}

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          提交
        </Button>
      </Form.Item>
    </Form>
  );
};

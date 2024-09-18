/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { FormLayout } from "@scow/lib-web/build/layouts/FormLayout";
import { App, Button, Form, Input, InputNumber, Select, Space } from "antd";
import { NextPage } from "next";
import React, { useState } from "react";
import { useStore } from "simstate";
import { api } from "src/apis";
import { requireAuth } from "src/auth/requireAuth";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { DisabledA } from "src/components/DisabledA";
import { ClusterNotAvailablePage } from "src/components/errorPages/ClusterNotAvailablePage";
import { PageTitle } from "src/components/PageTitle";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { TenantRole } from "src/models/User";
import type { ChangeStorageMode } from "src/pages/api/admin/changeStorage";
import { ClusterInfoStore } from "src/stores/ClusterInfoStore";
import { Cluster } from "src/utils/cluster";
import { Head } from "src/utils/head";

const p = prefix("page.tenant.storage.");

const changeModeText = {
  INCREASE: p("increase"),
  DECREASE: p("decrease"),
  SET: p("set"),
};

interface FormProps {
  mode: ChangeStorageMode;
  userId: string;
  cluster: Cluster;
  value: number;
}

const StorageForm: React.FC = () => {

  const [form] = Form.useForm<FormProps>();

  const [loading, setLoading] = useState(false);

  const [current, setCurrent] = useState<number | undefined>(undefined);
  const [currentLoading, setCurrentLoading] = useState(false);

  const { activatedClusters, defaultCluster } = useStore(ClusterInfoStore);
  if (!defaultCluster && Object.keys(activatedClusters).length === 0) {
    return <ClusterNotAvailablePage />;
  }

  const currentDefaultCluster = defaultCluster ?? Object.values(activatedClusters)[0];

  const t = useI18nTranslateToString();

  const { message } = App.useApp();

  const submit = async () => {
    const { value, userId, cluster, mode } = await form.validateFields();
    setLoading(true);

    await api.changeStorageQuota({ body: { value, userId, cluster: cluster.id, mode } })
      .httpError(404, () => { message.error(t(p("userNotFound"))); })
      .httpError(400, () => { message.error(t(p("balanceChangeIllegal"))); })
      .then(({ currentQuota }) => {
        message.success(t(p("editSuccess")));
        setCurrent(currentQuota);
      })
      .finally(() => setLoading(false));
  };

  const queryCurrent = async () => {
    const cluster = form.getFieldValue("cluster") as Cluster;
    const userId = form.getFieldValue("userId");
    if (!cluster || !userId) {
      message.error(t(p("inputUserIdAndCluster")));
      return;
    }
    setCurrentLoading(true);
    await api.queryStorageQuota({ query: { cluster: cluster.id, userId } })
      .httpError(404, () => { message.error(t(p("userNotFound"))); })
      .then(({ currentQuota }) => {
        setCurrent(currentQuota);
      })
      .finally(() => setCurrentLoading(false));
  };

  return (
    <Form
      form={form}
      wrapperCol={{ span: 20 }}
      labelCol={{ span: 4 }}
      labelAlign="right"
      onFinish={submit}
      initialValues={{ mode: "SET", value: 1 }}
    >
      <Form.Item
        name="userId"
        label={t("common.userId")}
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="cluster"
        label={t("common.cluster")}
        rules={[{ required: true }]}
        initialValue={currentDefaultCluster}
      >
        <SingleClusterSelector />
      </Form.Item>
      <Form.Item label={t(p("currentSpace"))}>
        <DisabledA onClick={queryCurrent} disabled={currentLoading}>
          {
            currentLoading
              ? t(p("searching"))
              : current === undefined
                ? t(p("clickSearch"))
                : `${current} TB`
          }
        </DisabledA>
      </Form.Item>
      <Form.Item label={t(p("storageChange"))} rules={[{ required: true }]}>
        <Space.Compact style={{ width: "100%" }}>
          <Form.Item name="mode" noStyle>
            <Select placeholder={t(p("selectSetTo"))}>
              {Object.entries(changeModeText).map(([key, value]) => (
                <Select.Option value={key} key={key}>{t(value)}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="value" noStyle>
            <InputNumber min={1} step={1} addonAfter={"TB"} />
          </Form.Item>
        </Space.Compact>
      </Form.Item>
      <Form.Item wrapperCol={{ span: 6, offset: 4 }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          {t("common.submit")}
        </Button>
      </Form.Item>
    </Form>
  );
};

export const AdminStoragePage: NextPage = requireAuth((i) => i.tenantRoles.includes(TenantRole.TENANT_ADMIN))(
  () => {
    const t = useI18nTranslateToString();

    return (
      <div>
        <Head title={t(p("adjustUserStorageSpace"))} />
        <PageTitle titleText={t(p("adjustUserStorageSpace"))} />
        <FormLayout>
          <StorageForm />
        </FormLayout>
      </div>
    );
  });

export default AdminStoragePage;

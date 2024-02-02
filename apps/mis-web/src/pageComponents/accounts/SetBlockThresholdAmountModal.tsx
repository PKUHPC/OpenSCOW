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

import { numberToMoney } from "@scow/lib-decimal";
import type { Money } from "@scow/protos/build/common/money";
import { App, Form, InputNumber, Modal } from "antd";
import { useState } from "react";
import { api } from "src/apis";
import { ModalLink } from "src/components/ModalLink";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { publicConfig } from "src/utils/config";
import { moneyToString } from "src/utils/money";

interface Props {
  accountName: string;
  currentAmount: Money | undefined;
  balance: Money;
  open: boolean;
  onClose: () => void;
  reload: () => void;
}

interface FormFields {
  blockThresholdAmount: number;
}


const p = prefix("pageComp.accounts.setBlockThresholdAmountModal.");
const pCommon = prefix("common.");

export const SetBlockThresholdAmountModal: React.FC<Props> = ({
  accountName, onClose, reload, open, currentAmount, balance,
}) => {

  const t = useI18nTranslateToString();

  const [form] = Form.useForm<FormFields>();
  const [loading, setLoading] = useState(false);

  const { message } = App.useApp();

  const onOk = async () => {
    const { blockThresholdAmount } = await form.validateFields();
    setLoading(true);
    await api.setBlockThreshold({ body: { accountName, blockThresholdAmount } })
      .then((res) => {
        if (res.executed) {
          message.success(t(p("setSuccess")));
          reload();
          onClose();
        } else {
          message.error(res.reason || t(p("setFail")));
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <Modal
      title={`${t(pCommon("modify"))}${t(p("blockThresholdAmount"))}`}
      open={open}
      onCancel={onClose}
      confirmLoading={loading}
      onOk={onOk}
    >
      <Form
        form={form}
        initialValues={{ blockThresholdAmount:
          currentAmount
            ? moneyToString(currentAmount)
            : numberToMoney(publicConfig.DEFAULT_ACCOUNT_BLOCK_THRESHOLD) }}
      >
        <Form.Item label={t(pCommon("accountName"))}>
          <strong>{accountName}</strong>
        </Form.Item>
        <Form.Item label={t(pCommon("balance"))}>
          <strong>{moneyToString(balance)}</strong>
        </Form.Item>
        <Form.Item name="blockThresholdAmount" label={t(p("setAmount"))} required>
          <InputNumber precision={2} />
        </Form.Item>
      </Form>

    </Modal>

  );
};

export const SetBlockThresholdAmountLink = ModalLink(SetBlockThresholdAmountModal);

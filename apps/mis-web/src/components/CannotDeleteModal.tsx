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

import { Modal } from "antd";
import { ModalLink } from "src/components/ModalLink";
import { prefix, useI18nTranslateToString } from "src/i18n";

interface Props {
  onClose: () => void;
  open: boolean;
}

const p = prefix("component.others.");

const CannotDeleteModal: React.FC<Props> = ({ onClose, open }) => {
  const t = useI18nTranslateToString();

  return (
    <Modal
      title={t(p("deleteUser2"))}
      open={open}
      onOk={onClose}
      onCancel={onClose}
      width={620} // 设置Modal宽度
    >
      <p>
        <b>{t(p("cannotDeleteSelf"))}</b>
      </p>
    </Modal>
  );
};

export const CannotDeleteModalLink = ModalLink(CannotDeleteModal);

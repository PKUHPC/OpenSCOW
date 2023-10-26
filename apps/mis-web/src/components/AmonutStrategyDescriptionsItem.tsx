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

import { QuestionCircleOutlined } from "@ant-design/icons";
import { Popover, Space } from "antd";
import React from "react";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { getAmountStrategyAlgorithmDescriptions,
  getAmountStrategyDescription, getAmountStrategyDescriptions, getAmountStrategyText } from "src/models/job";
import { publicConfig } from "src/utils/config";


interface Props {
  isColContent?: boolean;
  amount?: string;
  isColTitle?: boolean;
}

const customAmountStrategiesIdToName = {};
const customAmountStrategiesIdToDescription = {};
publicConfig.CUSTOM_AMOUNT_STRATEGIES?.forEach((i) => {
  customAmountStrategiesIdToName[i.id] = i.name || i.id;
  customAmountStrategiesIdToDescription[i.id] = i.comment || i.id;
});

const p = prefix("component.others.");

export const AmountStrategyDescriptionsItem: React.FC<Props> = ({
  amount, isColTitle, isColContent,
}) => {

  const t = useI18nTranslateToString();
  const AmountStrategyDescriptions = getAmountStrategyDescriptions(t);
  const AmountStrategyAlgorithmDescriptions = getAmountStrategyAlgorithmDescriptions(t);
  const AmountStrategyText = getAmountStrategyText(t);
  const AmountStrategyDescription = getAmountStrategyDescription(t);

  if (isColContent && amount) {
    return (
      <Space>
        {{ ...AmountStrategyDescriptions, ...customAmountStrategiesIdToName }[amount]}
        <Popover title={`${{
          ...AmountStrategyAlgorithmDescriptions,
          ...customAmountStrategiesIdToDescription,
        }[amount]}`}
        >
          <QuestionCircleOutlined />
        </Popover>
      </Space>
    );
  }
  if (isColTitle) {
    return (
      <Space>
        {AmountStrategyText}
        <Popover
          title={AmountStrategyDescription}
          content={(
            <div>
              <p>
                {Object.entries({ ...AmountStrategyDescriptions, ...customAmountStrategiesIdToName })
                  .map((value) => <p key={value[0]}>{`${value[1]}(${value[0]})`}</p>)}
              </p>
              <a href="https://pkuhpc.github.io/SCOW/docs/info/mis/business/billing">{t(p("seeDetails"))}</a>
            </div>
          )}
        >
          <QuestionCircleOutlined />
        </Popover>
      </Space>
    );
  }
};

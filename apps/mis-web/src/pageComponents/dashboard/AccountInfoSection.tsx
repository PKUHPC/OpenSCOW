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

import { LockOutlined, UnlockOutlined } from "@ant-design/icons";
import { moneyToNumber } from "@scow/lib-decimal";
import { Alert, Col, Row, Statistic, StatisticProps } from "antd";
import React from "react";
import { Section } from "src/components/Section";
import { StatCard } from "src/components/StatCard";
import { UserStatus } from "src/models/User";
import type { AccountInfo } from "src/pages/dashboard";
import useI18nTranslateToString from "src/utils/useI18nTranslateToString";
import styled from "styled-components";



interface Props {
  info: Record<string, AccountInfo>;
}

const CardContainer = styled.div`
  flex: 1;
  min-width: 300px;
  margin: 4px;
`;

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const Info: React.FC<StatisticProps> = (props) => (
  <Col span={8}>
    <Statistic {...props} />
  </Col>
);


export const AccountInfoSection: React.FC<Props> = ({ info }) => {

  const accounts = Object.entries(info);

  const { t } = useI18nTranslateToString();

  const statusTexts = {
    blocked: [t("dashboard.account.status.blocked"), "red", LockOutlined],
    normal: [t("dashboard.account.status.normal"), "green", UnlockOutlined],

  } as const;

  return (
    <Section title={t("dashboard.account.title")}>
      {
        accounts.length === 0 ? (
          <Alert message={t("dashboard.account.alert")} type="warning" showIcon />
        ) : (
          <Container>
            {
              accounts.map(([accountName, {
                accountBlocked, userStatus, balance,
                jobChargeLimit, usedJobCharge,
              }]) => {

                const [text, textColor, Icon] = accountBlocked || userStatus === UserStatus.BLOCKED
                  ? statusTexts.blocked
                  : statusTexts.normal;

                const availableLimit = jobChargeLimit && usedJobCharge
                  ? moneyToNumber(jobChargeLimit) - moneyToNumber(usedJobCharge)
                  : undefined;

                const minOne = availableLimit ? Math.min(availableLimit, balance) : balance;

                return (
                  <CardContainer key={accountName}>
                    <StatCard title={`${accountName}`}>
                      <Row style={{ flex: 1, width: "100%" }}>
                        <Info
                          title={t("dashboard.account.state")}
                          valueStyle={{ color: textColor }}
                          prefix={<Icon />}
                          value={text}
                        />
                        <Info
                          title={t("dashboard.account.balance")}
                          valueStyle={{ color: minOne < 0 ? "red" : undefined }}
                          prefix={"￥"}
                          value={minOne.toFixed(3)}
                        />
                      </Row>
                    </StatCard>
                  </CardContainer>
                );
              })
            }
          </Container>
        )
      }
    </Section>

  );

};

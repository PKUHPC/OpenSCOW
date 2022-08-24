import { LockOutlined, UnlockOutlined } from "@ant-design/icons";
import { moneyToNumber } from "@scow/lib-decimal";
import { Alert, Col, Row, Statistic, StatisticProps } from "antd";
import React from "react";
import { Section } from "src/components/Section";
import { StatCard } from "src/components/StatCard";
import { UserStatus } from "src/models/User";
import type { AccountInfo } from "src/pages/dashboard";
import styled from "styled-components";

const statusTexts = {
  blocked: ["封锁", "red", LockOutlined],
  normal: ["正常", "green", UnlockOutlined],

} as const;

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

  return (
    <Section title="账户信息">
      {
        accounts.length === 0 ? (
          <Alert message="您不属于任何一个账户。" type="warning" showIcon />
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
                          title="状态"
                          valueStyle={{ color: textColor }}
                          prefix={<Icon />}
                          value={text}
                        />
                        <Info
                          title={"可用余额"}
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

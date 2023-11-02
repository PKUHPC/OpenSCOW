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

import { MoneyCollectOutlined, PlayCircleOutlined, ProjectOutlined,
  TeamOutlined, UserOutlined, WalletOutlined } from "@ant-design/icons";
import { moneyToNumber } from "@scow/lib-decimal";
import { getDefaultPresets } from "@scow/lib-web/build/utils/datetime";
import { Card, Col, DatePicker, Row, Space } from "antd";
import dayjs from "dayjs";
import { NextPage } from "next";
import { useCallback, useMemo, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { useI18n, useI18nTranslateToString } from "src/i18n";
import { getOperationTypeTexts } from "src/models/operationLog";
import { PlatformRole } from "src/models/User";
import { DataBarChart } from "src/pageComponents/admin/DataBarChart";
import { DataLineChart } from "src/pageComponents/admin/DataLineChart";
import StatisticCard from "src/pageComponents/admin/StatisticCard";
import { Head } from "src/utils/head";
import { styled } from "styled-components";


const formateData = (data: Array<{ date: string, count: number }>, dateRange: [dayjs.Dayjs, dayjs.Dayjs]) => {
  const input = data.map((d) => ({
    date: new Date(d.date),
    count: d.count,
  }));
  const countData: {date: dayjs.Dayjs, count: number}[] = [];
  const [startDate, endDate] = dateRange;
  const days = endDate.diff(startDate, "day");
  let curDate = startDate.clone();
  for (let i = 0; i < days; i++) {
    const v = input?.find((x) => {
      return curDate.isSame(x.date, "day");
    });
    if (v) {
      countData[i] = {
        date: curDate.clone(),
        count: v.count,
      };
    } else {
      countData[i] = {
        date: curDate.clone(),
        count: 0,
      };
    }
    curDate = curDate.add(1, "day");
  }
  return countData;
};
const TitleText = styled.span`
  font-size: 24px;
  font-weight: bold;
`;

export const PlatformStatisticsPage: NextPage =
requireAuth((u) => u.platformRoles.includes(PlatformRole.PLATFORM_ADMIN))
(() => {

  const t = useI18nTranslateToString();
  const languageId = useI18n().currentLanguage.id;

  const OperationTypeTexts = getOperationTypeTexts(t);

  const today = dayjs().endOf("day");
  const [query, setQuery] = useState<{filterTime: [dayjs.Dayjs, dayjs.Dayjs],}>({
    filterTime: [today.clone().subtract(7, "day"), today],
  });

  const getStatisticInfoFn = useCallback(async () => {
    return await api.getStatisticInfo({ query: {
      startTime: query.filterTime[0].toISOString(),
      endTime: query.filterTime[1].toISOString(),
    } });
  }, [query]);

  const { data: statisticInfo, isLoading: statisticInfoLoading } = useAsync({ promiseFn: getStatisticInfoFn });

  const getJobTotalCountFn = useCallback(async () => {
    return await api.getJobTotalCount({});
  }, []);

  const { data: jobTotalCount, isLoading: jobTotalCountLoading } = useAsync({ promiseFn: getJobTotalCountFn });

  const promiseFn1 = useCallback(async () => {
    return await api.getNewUserCount({ query: {
      startTime: query.filterTime[0].toISOString(),
      endTime: query.filterTime[1].toISOString(),
    } });
  }, [query]);

  const { data: newUserCount, isLoading: newUserLoading } = useAsync({ promiseFn: promiseFn1 });

  const promiseFn2 = useCallback(async () => {
    return await api.getActiveUserCount({ query: {
      startTime: query.filterTime[0].toISOString(),
      endTime: query.filterTime[1].toISOString(),
    } });
  }, [query]);

  const { data: activeUserCount, isLoading: activeUserLoading } = useAsync({ promiseFn: promiseFn2 });

  const promiseFn3 = useCallback(async () => {
    return await api.getTopChargeAccount({ query: {
      startTime: query.filterTime[0].toISOString(),
      endTime: query.filterTime[1].toISOString(),
    } });
  }, [query]);

  const { data: topChargeAccount, isLoading: topChargeAccountLoading } = useAsync({ promiseFn: promiseFn3 });

  const promiseFn4 = useCallback(async () => {
    return await api.getTopPayAccount({ query: {
      startTime: query.filterTime[0].toISOString(),
      endTime: query.filterTime[1].toISOString(),
    } });
  }, [query]);

  const { data: topPayAccount, isLoading: topPayAccountLoading } = useAsync({ promiseFn: promiseFn4 });

  const promiseFn5 = useCallback(async () => {
    return await api.getDailyCharge({ query: {
      startTime: query.filterTime[0].toISOString(),
      endTime: query.filterTime[1].toISOString(),
    } });
  }, [query]);

  const { data: dailyCharge, isLoading: dailyChargeLoading } = useAsync({ promiseFn: promiseFn5 });

  const promiseFn6 = useCallback(async () => {
    return await api.getDailyPay({ query: {
      startTime: query.filterTime[0].toISOString(),
      endTime: query.filterTime[1].toISOString(),
    } });
  }, [query]);

  const { data: dailyPay, isLoading: dailyPayLoading } = useAsync({ promiseFn: promiseFn6 });

  const promiseFn7 = useCallback(async () => {
    return await api.getTopSubmitJobUser({ query: {
      startTime: query.filterTime[0].toISOString(),
      endTime: query.filterTime[1].toISOString(),
    } });
  }, [query]);

  const { data: topSubmitJobUser, isLoading: topSubmitJobUserLoading } = useAsync({ promiseFn: promiseFn7 });

  const promiseFn8 = useCallback(async () => {
    return await api.getNewJobCount({ query: {
      startTime: query.filterTime[0].toISOString(),
      endTime: query.filterTime[1].toISOString(),
    } });
  }, [query]);

  const { data: dailyNewJobCount, isLoading: dailyNewJobCountLoading } = useAsync({ promiseFn: promiseFn8 });


  const promiseFn9 = useCallback(async () => {
    return await api.getPortalUsageCount({ query: {
      startTime: query.filterTime[0].toISOString(),
      endTime: query.filterTime[1].toISOString(),
    } });
  }, [query]);

  const { data: portalUsageCount, isLoading: portalUsageCountLoading } = useAsync({ promiseFn: promiseFn9 });

  const promiseFn10 = useCallback(async () => {
    return await api.getMisUsageCount({ query: {
      startTime: query.filterTime[0].toISOString(),
      endTime: query.filterTime[1].toISOString(),
    } });
  }, [query]);

  const { data: misUsageCount, isLoading: misUsageCountLoading } = useAsync({ promiseFn: promiseFn10 });

  const newUserCountData = useMemo(() => {
    if (newUserCount) {
      return formateData(newUserCount?.results, query.filterTime);
    }
    return [];
  }, [query, newUserCount]);

  const activeUserCountData = useMemo(() => {

    if (activeUserCount) {
      return formateData(activeUserCount?.results, query.filterTime);
    }
    return [];
  }, [query, activeUserCount]);


  const topChargeAccountData = useMemo(() => {

    return topChargeAccount?.results.map((r) => ({
      x: r.accountName,
      y: moneyToNumber(r.chargedAmount),
    })) || [];
  }, [query, topChargeAccount]);

  const topPayAccountData = useMemo(() => {

    return topPayAccount?.results.map((r) => ({
      x: r.accountName,
      y: moneyToNumber(r.payAmount),
    })) || [];
  }, [query, topPayAccount]);

  const dailyChargeData = useMemo(() => {
    if (dailyCharge) {
      return formateData(dailyCharge?.results
        .map((d) => ({ date: d.date, count: moneyToNumber(d.amount) })), query.filterTime);
    }
    return [];
  }, [query, dailyCharge]);

  const dailyPayData = useMemo(() => {
    if (dailyPay) {
      return formateData(dailyPay?.results
        .map((d) => ({ date: d.date, count: moneyToNumber(d.amount) })), query.filterTime);
    }
    return [];
  }, [query, dailyPay]);

  const topSubmitJobUserData = useMemo(() => {

    return topSubmitJobUser?.results.map((r) => ({
      x: r.userId,
      y: r.count,
    })) || [];
  }, [query, topSubmitJobUser]);

  const newJobCountData = useMemo(() => {
    if (dailyNewJobCount) {
      return formateData(dailyNewJobCount?.results, query.filterTime);
    }
    return [];
  }, [query, dailyNewJobCount]);

  const totalNewJobCount = useMemo(() => {
    if (dailyNewJobCount) {
      return dailyNewJobCount?.results.reduce((pre, cur) => pre + cur.count, 0);
    }
    return 0;
  }, [dailyNewJobCount]);

  const totalChargeAmount = useMemo(() => {
    if (dailyCharge) {
      return dailyCharge?.results.reduce((pre, cur) => pre + moneyToNumber(cur.amount), 0);
    }
    return 0;
  }, [dailyCharge]);

  const portalUsageCountData = useMemo(() => {
    if (portalUsageCount) {
      return portalUsageCount.results;
    }
    return [];
  }, [query, portalUsageCount]);

  const misUsageCountData = useMemo(() => {
    if (misUsageCount) {
      return misUsageCount.results;
    }
    return [];
  }, [query, misUsageCount]);

  return (
    <>
      <Head title="平台信息" />
      <PageTitle titleText={"数据总览"} />
      <Row gutter={[16, 16]}>
        <Col span={24} style={{ textAlign: "right" }}>
          <span>日期筛选：</span>
          <DatePicker.RangePicker
            allowClear={false}
            presets={getDefaultPresets(languageId)}
            defaultValue={[query.filterTime?.[0], query.filterTime?.[1]]}
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                setQuery({ filterTime: [dates[0], dates[1]]});
              }
            }}
          />
        </Col>
        <Col flex={4}>
          <StatisticCard
            title="用户"
            newAddValue={statisticInfo?.newUser}
            totalValue={statisticInfo?.totalUser}
            loading={statisticInfoLoading}
            icon={UserOutlined}
            iconColor="#94070A"
          />
        </Col>
        <Col flex={4}>
          <StatisticCard
            title="账户"
            newAddValue={statisticInfo?.newAccount}
            totalValue={statisticInfo?.totalAccount}
            loading={statisticInfoLoading}
            icon={WalletOutlined}
            iconColor="#2e86de"
          />
        </Col>
        <Col flex={4}>
          <StatisticCard
            title="租户"
            newAddValue={statisticInfo?.newTenant}
            totalValue={statisticInfo?.totalTenant}
            loading={statisticInfoLoading}
            icon={TeamOutlined}
            iconColor="#1dd1a1"
          />
        </Col>
        <Col flex={4}>
          <StatisticCard
            title="作业"
            newAddValue={totalNewJobCount}
            totalValue={jobTotalCount?.count}
            loading={jobTotalCountLoading || dailyNewJobCountLoading}
            icon={ProjectOutlined}
            iconColor="#8395a7"
          />
        </Col>
        <Col flex={4}>
          <StatisticCard
            title="消费"
            newAddValue={totalChargeAmount}
            totalValue={999}
            loading={false}
            icon={MoneyCollectOutlined}
            iconColor="#feca57"
          />
        </Col>
        <Col span={24}>
          <Card
            title={(
              <Space align="baseline">
                <UserOutlined style={{ fontSize: "24px", color: "#94070A" }} />
                <TitleText>用户数量</TitleText>
              </Space>
            )}
            bordered={false}
          >
            <Row>
              <Col span={12}>
                <DataLineChart
                  data={
                    newUserCountData.map((d) => ({
                      x: d.date.format("YYYY-MM-DD"),
                      y: d.count,
                    }))}
                  isLoading={newUserLoading}
                  title="新增用户数"
                ></DataLineChart>
              </Col>
              <Col span={12}>
                <DataLineChart
                  data={activeUserCountData.map((d) => ({
                    x: d.date.format("YYYY-MM-DD"),
                    y: d.count,
                  }))}
                  title="活跃用户数"
                  isLoading={activeUserLoading}
                ></DataLineChart>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={24}>
          <Card
            title={(
              <Space align="baseline">
                <MoneyCollectOutlined style={{ fontSize: "24px", color: "#feca57" }} />
                <TitleText>消费/充值金额</TitleText>
              </Space>
            )}
            bordered={false}
          >
            <Row>
              <Col span={12}>
                <DataBarChart
                  data={topChargeAccountData}
                  title="消费账户TOP10"
                  isLoading={topChargeAccountLoading}
                  xLabel="账户名"
                />
              </Col>
              <Col span={12}>
                <DataLineChart
                  data={dailyChargeData.map((d) => ({
                    x: d.date.format("YYYY-MM-DD"),
                    y: d.count,
                  }))}
                  title="消费金额"
                  isLoading={dailyChargeLoading}
                />
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <DataBarChart
                  data={topPayAccountData}
                  title="充值账户TOP10"
                  isLoading={topPayAccountLoading}
                  xLabel="账户名"
                />
              </Col>
              <Col span={12}>
                <DataLineChart
                  data={dailyPayData.map((d) => ({
                    x: d.date.format("YYYY-MM-DD"),
                    y: d.count,
                  }))}
                  title="充值金额"
                  isLoading={dailyPayLoading}
                />
              </Col>
            </Row>
          </Card>
        </Col>


        <Col span={24}>
          <Card
            title={(
              <Space align="baseline">
                <ProjectOutlined style={{ fontSize: "24px", color: "#8395a7" }} />
                <TitleText>作业</TitleText>
              </Space>
            )}
            bordered={false}
          >
            <Row>
              <Col span={12}>
                <DataBarChart
                  data={topSubmitJobUserData}
                  title="作业提交用户TOP10"
                  isLoading={topSubmitJobUserLoading}
                  xLabel="用户名"
                />
              </Col>
              <Col span={12}>
                <DataLineChart
                  data={newJobCountData.map((d) => ({
                    x: d.date.format("YYYY-MM-DD"),
                    y: d.count,
                  }))}
                  title="新增作业数量"
                  isLoading={dailyNewJobCountLoading}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={24}>
          <Card
            title={(
              <Space align="baseline">
                <PlayCircleOutlined style={{ fontSize: "24px", color: "black" }} />
                <TitleText>系统功能使用统计</TitleText>
              </Space>
            )}
            bordered={false}
          >
            <Row>
              <Col span={12}>
                <DataBarChart
                  data={portalUsageCountData.map((d) => ({
                    x: OperationTypeTexts[d.operationType],
                    y: d.count,
                  }))}
                  title="门户系统使用功能次数"
                  isLoading={portalUsageCountLoading}
                />
              </Col>
              <Col span={12}>
                <DataBarChart
                  data={misUsageCountData.map((d) => ({
                    x: OperationTypeTexts[d.operationType],
                    y: d.count,
                  }))}
                  title="管理系统使用功能次数"
                  isLoading={misUsageCountLoading}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </>
  );
});


export default PlatformStatisticsPage;

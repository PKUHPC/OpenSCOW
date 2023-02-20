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

import { Typography } from "antd";
import { useCallback } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { Centered } from "src/components/layouts";
import { ManageJobBillingTable } from "src/pageComponents/job/ManageJobBillingTable";
import { getActiveBillingItems } from "src/utils/job";

export const InitJobBillingTable: React.FC = () => {
  const { data, isLoading, reload } = useAsync({ promiseFn: useCallback(async () => {
    const sourceData = await api.getBillingItems({ 
      query: { tenant: undefined, activeOnly: false },
    }).then((x) => x.items);
    return getActiveBillingItems(sourceData, undefined);
  }, []) });

  return (
    <Centered>
      <div>
        <Typography.Paragraph>
          您可以在这里设置默认作业价格表。您必须全部设置完全部价格才能完成初始化。
          <a onClick={reload}>刷新</a>
        </Typography.Paragraph>
        <ManageJobBillingTable
          data={data}
          loading={isLoading}
          tenant={undefined}
          reload={reload}
        />
      </div>
    </Centered>
  );
};
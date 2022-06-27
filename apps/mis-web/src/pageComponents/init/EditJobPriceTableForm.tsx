import { useCallback } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { Centered } from "src/components/layouts";
import { EditableJobBillingTable } from "src/pageComponents/job/EditableJobBillingTable";

export const EditJobPriceTableForm: React.FC = () => {

  const { data, isLoading, reload } = useAsync({ promiseFn: useCallback(async () => {
    return await api.getBillingTable({ query: { } }).then((x) => x.items);
  }, []) });

  return (
    <Centered>
      <div>
        <p>您可以在这里设置默认作业价格表。未设置的将会以0元计费。</p>
        <EditableJobBillingTable reload={reload} data={data} loading={isLoading}  />
      </div>
    </Centered>
  );

};

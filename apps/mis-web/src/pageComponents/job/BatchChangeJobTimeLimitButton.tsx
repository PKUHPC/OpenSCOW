import { Button } from "antd";
import { useState } from "react";
import { RunningJobInfo } from "src/models/job";
import { ChangeJobTimeLimitModal } from "src/pageComponents/job/ChangeJobTimeLimitModal";

interface ChangeJobTimeLimitButtonProps {
  data: RunningJobInfo[];
  disabled: boolean;
  reload: () => void;
}

export const BatchChangeJobTimeLimitButton: React.FC<ChangeJobTimeLimitButtonProps> = ({
  data, disabled, reload,
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button disabled={disabled} onClick={() => setVisible(true)}>
        延长所选作业时间限制
      </Button>
      <ChangeJobTimeLimitModal
        reload={reload}
        onClose={() => setVisible(false)}
        visible={visible}
        data={data}
      />
    </>
  );

};

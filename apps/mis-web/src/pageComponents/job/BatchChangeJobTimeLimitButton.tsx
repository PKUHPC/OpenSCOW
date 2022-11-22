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
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button disabled={disabled} onClick={() => setOpen(true)}>
        延长所选作业时间限制
      </Button>
      <ChangeJobTimeLimitModal
        reload={reload}
        onClose={() => setOpen(false)}
        open={open}
        data={data}
      />
    </>
  );

};

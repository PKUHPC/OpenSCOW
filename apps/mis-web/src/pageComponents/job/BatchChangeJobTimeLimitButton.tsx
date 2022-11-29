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

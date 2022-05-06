import { Button } from "antd";
import { NextPage } from "next";
import { requireAuth } from "src/auth/requireAuth";
import { CLUSTERS } from "src/utils/config";
import { Head } from "src/utils/head";

export const ShellIndexPage: NextPage = requireAuth(() => true)(() => {
  return (
    <div>
      <Head title="终端" />
      <h1>
        启动以下集群的终端：
      </h1>
      {CLUSTERS.map(({ id, name }) => (
        <a href={`/shell/${id}`} target="__blank">
          <Button>
            {name}
          </Button>
        </a>
      ))}
    </div>
  );
});

export default ShellIndexPage;

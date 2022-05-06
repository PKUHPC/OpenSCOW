import { Button } from "antd";
import { NextPage } from "next";
import { api } from "src/apis";
import { requireAuth } from "src/auth/requireAuth";
import { NotFoundPage } from "src/components/errorPages/NotFoundPage";
import { publicConfig } from "src/utils/config";
import { Head } from "src/utils/head";

export const DesktopIndexPage: NextPage = requireAuth(() => true)(() => {

  if (!publicConfig.ENABLE_VNC) {
    return <NotFoundPage />;
  }

  const onClick = async () => {
    const resp = await api.launchDesktop({ body: { } });

    const params = new URLSearchParams({
      path: `/vnc-server/${resp.node}/${resp.port}`,
      password: resp.password,
      autoconnect: "true",
      reconnect: "true",
    });

    window.open("/vnc/vnc.html?" + params.toString(), "_blank");
  };

  return (
    <div>
      <Head title="桌面" />
      <h1>
        启动桌面
      </h1>
      <Button onClick={onClick}>
        启动
      </Button>
    </div>
  );
});

export default DesktopIndexPage;

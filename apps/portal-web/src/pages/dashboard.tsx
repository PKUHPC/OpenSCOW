import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useStore } from "simstate";
import { requireAuth } from "src/auth/requireAuth";
import { UserStore } from "src/stores/UserStore";
import { Head } from "src/utils/head";

interface Props { }

export const DashboardPage: NextPage<Props> = requireAuth(() => true)((props: Props) => {

  const userStore = useStore(UserStore);
  const router = useRouter();

  useEffect(() => {
    router.replace(router.asPath);
  }, [userStore.user]);

  return (
    <div>
      <Head title="仪表盘" />
    </div>
  );
});


export default DashboardPage;

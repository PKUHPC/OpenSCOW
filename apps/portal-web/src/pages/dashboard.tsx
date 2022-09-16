import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useStore } from "simstate";
import { requireAuth } from "src/auth/requireAuth";
import { CustomizableLogoAndText } from "src/pageComponents/dashboard/CustomizableLogoAndText";
import { UserStore } from "src/stores/UserStore";
import { Head } from "src/utils/head";
import { getHostname } from "src/utils/host";

interface Props { 
  hostname : string | undefined
}

export const DashboardPage: NextPage<Props> = requireAuth(() => true)((props: Props) => {

  const userStore = useStore(UserStore);
  const router = useRouter();

  useEffect(() => {
    router.replace(router.asPath);
  }, [userStore.user]);

  return (
    <div>
      <Head title="仪表盘" />

      <CustomizableLogoAndText hostname={props.hostname} />
    </div>
  );
});

export const getServerSideProps: GetServerSideProps<Props> = async ({ req }) => {
 
  const hostname = getHostname(req);

  return {
    props: {
      hostname,
    },
  };
};


export default DashboardPage;

import { NextPage } from "next";
import { useStore } from "simstate";
import { Redirect } from "src/components/Redirect";
import { PlatformRole } from "src/models/User";
import { UserStore } from "src/stores/UserStore";

export const IndexPage: NextPage = () => {
  const userStore = useStore(UserStore);

  if (userStore.user) {
    if (userStore.user.platformRoles.length === 0 && userStore.user.accountAffiliations.length === 0) {
      return <Redirect url="/noAccount" />;
    } else {
      if (userStore.user.accountAffiliations.length > 0) {
        return <Redirect url="/dashboard" />;
      } else {
        const platformRole = userStore.user.platformRoles[0];

        if (platformRole === PlatformRole.PLATFORM_FINANCE) {
          return <Redirect url="/finance/pay" />;
        } else {
          return <Redirect url="/admin"/>;
        }
      }
    }
  } else {
    return <Redirect url="/api/auth" />;
  }

};


export default IndexPage;

import { NextPage } from "next";
import { requireAuth } from "src/auth/requireAuth";
import { Redirect } from "src/components/Redirect";
import { userRoutes } from "src/layouts/routes";

export const IndexPage: NextPage = requireAuth(() => true)(({ userStore }) => {
  return (
    <Redirect url={userRoutes(userStore.user.accountAffiliations)[2].children![0].path} />
  );
});

export default IndexPage;

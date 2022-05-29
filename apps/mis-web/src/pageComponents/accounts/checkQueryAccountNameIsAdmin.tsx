import { ForbiddenPage } from "src/components/errorPages/ForbiddenPage";
import { UserRole } from "src/models/User";
import type { User } from "src/stores/UserStore";
import { queryToString, useQuerystring } from "src/utils/querystring";

export const checkQueryAccountNameIsAdmin = (u: User) => {
  const query = useQuerystring();
  const accountName = queryToString(query.accountName);

  const account = u.accountAffiliations.find((x) => x.accountName === accountName);
  if (!account || account.role === UserRole.USER) {
    return <ForbiddenPage />;
  }
};

export const useAccountPagesAccountName = () => {
  const query = useQuerystring();
  const accountName = queryToString(query.accountName);

  return accountName;
};

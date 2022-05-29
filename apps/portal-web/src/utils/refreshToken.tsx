import React, { useCallback, useState } from "react";
import { ClickableA } from "src/components/ClickableA";

export function useRefreshToken() {
  const [refreshToken, setRefreshToken] = useState(false);

  const updateRefreshToken =
    useCallback(() => setRefreshToken((original) => !original), []);

  return [refreshToken, updateRefreshToken] as const;
}

export interface Refreshable {
  refreshToken: boolean;
}

interface RefreshLinkProps {
  refresh: () => void;
}

export const RefreshLink: React.FC<RefreshLinkProps> = ({ refresh }) => (
  <ClickableA onClick={refresh}>刷新</ClickableA>
);

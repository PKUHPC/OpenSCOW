"use client";

import Link from "next/link";
import { trpc } from "src/server/trpc/api";

export default function Home() {
  const { data } = trpc.auth.getUserInfo.useQuery();

  return (
    <div>
      <h1>SCOW PARTITIONS: LOCAL TEST PAGE</h1>
      <h1>app router {data?.user.identityId}</h1>
      <nav>
        <ul>
          <li>
            <Link href="/extensions/accountDefaultPartitions">
              Go to ACCOUNT_DEFAULT_PARTITIONS
            </Link>
          </li>
          <li>
            <Link href="/extensions/accountDefaultClusters">
              Go to ACCOUNT_DEFAULT_CLUSTERS
            </Link>
          </li>
          <li>
            <Link href="/extensions/accountPartitions">
              Go to ACCOUNT_CLUSTERS_PARTITIONS
            </Link>
          </li>
          <li>
            <Link href="/extensions/tenantPartitions">
              Go to TENANT_CLUSTERS_PARTITIONS
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

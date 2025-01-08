import { ConnectRouter } from "@connectrpc/connect";
import { checkScowApiToken } from "@scow/lib-server";
import { ClusterPartitionService } from "@scow/scow-resource-protos/generated/resource/partition_connect";
import {
  AssignAccountOnCreateRequest,
  AssignAccountOnCreateResponse,
  GetAccountAssignedPartitionsForClusterRequest,
  GetAccountAssignedPartitionsForClusterResponse,
  GetAccountsAssignedClusterIdsRequest,
  GetAccountsAssignedClusterIdsResponse,
  GetAccountsAssignedClustersAndPartitionsRequest,
  GetAccountsAssignedClustersAndPartitionsResponse,
  GetClusterAssignedAccountsRequest,
  GetClusterAssignedAccountsResponse,
  GetTenantAssignedClustersAndPartitionsRequest,
  GetTenantAssignedClustersAndPartitionsResponse,
} from "@scow/scow-resource-protos/generated/resource/partition_pb";
import { commonConfig } from "src/server/config/common";
import { assignCreatedAccount, getAccountAssignedPartitionsInCluster,
  getAccountsAssignedClusterPartitions,
  getAccountsAssignedClusters,
  getClusterAssignedAccountsData,
  getTenantAssignedClusterPartitions } from "src/utils/commonServer";


export default (router: ConnectRouter) => {
  router.service(ClusterPartitionService, {

    /**
     * 获取账户数组的已授权集群
     * 主要用于判断登录用户的关联账户的可用集群
     * @param request
     * @returns
     */
    async getAccountsAssignedClusterIds(request: GetAccountsAssignedClusterIdsRequest, ctx):
    Promise<GetAccountsAssignedClusterIdsResponse> {

      await checkScowApiToken(ctx, commonConfig.scowApi);

      const { accountNames, tenantName } = request;
      const data = await getAccountsAssignedClusters(accountNames, tenantName);
      return new GetAccountsAssignedClusterIdsResponse({ assignedClusterIds: data });
    },

    /**
     * 获取账户在某集群下已授权的分区
     * 用于集群下对帐户的封锁解封等操作
     * @param request
     * @returns
     */
    async getAccountAssignedPartitionsForCluster(request: GetAccountAssignedPartitionsForClusterRequest, ctx):
    Promise<GetAccountAssignedPartitionsForClusterResponse> {
      await checkScowApiToken(ctx, commonConfig.scowApi);
      const { accountName, tenantName, clusterId } = request;
      const data = await getAccountAssignedPartitionsInCluster(accountName, tenantName, clusterId);
      return new GetAccountAssignedPartitionsForClusterResponse({ assignedPartitionNames: data });
    },

    /**
     * 获取账户数组的已授权集群与已授权分区信息
     * @param request
     * @returns
     */
    async getAccountsAssignedClustersAndPartitions(request: GetAccountsAssignedClustersAndPartitionsRequest, ctx):
    Promise<GetAccountsAssignedClustersAndPartitionsResponse> {
      await checkScowApiToken(ctx, commonConfig.scowApi);
      const { accountNames, tenantName } = request;
      const data = await getAccountsAssignedClusterPartitions(accountNames, tenantName);
      return new GetAccountsAssignedClustersAndPartitionsResponse({ assignedClusterPartitions: data });
    },

    /**
     * 获取租户的已授权集群与已授权分区信息
     * @param request
     * @returns
     */
    async getTenantAssignedClustersAndPartitions(request: GetTenantAssignedClustersAndPartitionsRequest, ctx):
    Promise<GetTenantAssignedClustersAndPartitionsResponse> {
      await checkScowApiToken(ctx, commonConfig.scowApi);
      const { tenantName } = request;
      const data = await getTenantAssignedClusterPartitions(tenantName);
      const result = new GetTenantAssignedClustersAndPartitionsResponse({ assignedClusterPartitions: data });
      return result;
    },

    /**
     * 创建账户时写入默认授权集群与默认授权分区
     * @param request
     * @returns
     */
    async assignAccountOnCreate(request: AssignAccountOnCreateRequest, ctx):
    Promise<AssignAccountOnCreateResponse> {
      await checkScowApiToken(ctx, commonConfig.scowApi);
      const { accountName, tenantName } = request;
      const result = await assignCreatedAccount(accountName, tenantName);
      return new AssignAccountOnCreateResponse({ executed: result });
    },

    /**
     * 提交作业/交互式应用时 选择集群后过滤已授权账户
     * @param request
     * @returns
     */
    async getClusterAssignedAccounts(request: GetClusterAssignedAccountsRequest, ctx):
    Promise<GetClusterAssignedAccountsResponse> {
      await checkScowApiToken(ctx, commonConfig.scowApi);
      const { clusterId, tenantName } = request;
      const result = await getClusterAssignedAccountsData(clusterId, tenantName);
      return new GetClusterAssignedAccountsResponse({ accountNames: result });
    },
  });
};

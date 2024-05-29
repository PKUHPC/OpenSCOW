/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * SCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

export enum PartitionOperationType {
  ACCOUNT_OPERATION = "ACCOUNT_OPERATION",
  TENANT_OPERATION = "TENANT_OPERATION"
}


export interface AccountTenantPartition {
  accountName: string,
  tenantName: string,
  assignablePartitions: AssignablePartition[],
  assignedTotalCount: number,
}


export enum AssignmentType {
  ASSIGN = "ASSIGN",
  UNASSIGN = "UNASSIGN"
}

export enum AssignmentState {
  ASSIGNED = "ASSIGNED",
  UNASSIGNED = "UNASSIGNED"
}


export interface AssignablePartition {
  clusterId: string,
  partition: string,
  assignmentState: AssignmentState,
}


export const testTenantData1: AccountTenantPartition = {
  accountName: "",
  tenantName: "defaultAAA",
  assignedTotalCount: 5,
  assignablePartitions: [
    { clusterId: "hpc01",
      partition: "normal1",
      assignmentState: AssignmentState.ASSIGNED,
    },
    { clusterId: "hpc01",
      partition: "normal2",
      assignmentState: AssignmentState.ASSIGNED,
    },
    { clusterId: "hpc01",
      partition: "normal3",
      assignmentState: AssignmentState.ASSIGNED,
    },
    { clusterId: "hpc01",
      partition: "normal4",
      assignmentState: AssignmentState.UNASSIGNED,
    },
    { clusterId: "hpc01",
      partition: "normal5",
      assignmentState: AssignmentState.UNASSIGNED,
    },
  ],

};

export const testAvailablePartitions = [
  { clusterId: "hpc01",
    partition: "normal1",
    assignmentState: AssignmentState.ASSIGNED,
  },
  { clusterId: "hpc01",
    partition: "normal2",
    assignmentState: AssignmentState.ASSIGNED,
  },
  { clusterId: "hpc01",
    partition: "normal3",
    assignmentState: AssignmentState.ASSIGNED,
  },
  { clusterId: "hpc01",
    partition: "normal4",
    assignmentState: AssignmentState.UNASSIGNED,
  },
  { clusterId: "hpc01",
    partition: "normal5",
    assignmentState: AssignmentState.UNASSIGNED,
  },
];

export const testAccountData1: AccountTenantPartition = {
  accountName: "a_admin",
  tenantName: "defaultAAA",
  assignedTotalCount: 5,
  assignablePartitions: testAvailablePartitions,

};


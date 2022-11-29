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

import { Entity, Index, PrimaryKey, Property } from "@mikro-orm/core";
import { misConfig } from "src/config/mis";

@Entity({ tableName: misConfig.fetchJobs.db.tableName })
export class OriginalJob {

  @PrimaryKey()
    biJobIndex!: number;

  @Property()
    idJob!: number;

  @Property({ length: 255, columnType: "tinytext", comment: "账户" })
    account!: string;

  @Index({ name: "user" })
  @Property({ length: 127, comment: "用户名" })
    user!: string;

  @Property({ length: 255, columnType: "tinytext", comment: "分区" })
    partition!: string;

  @Property({ columnType: "text", length: 65535, comment: "使用节点列表" })
    nodelist!: string;

  @Property({ length: 255, columnType: "tinytext", comment: "作业名" })
    jobName!: string;

  @Property({ length: 50, comment: "集群名" })
    cluster!: string;

  @Index({ name: "time_submit" })
  @Property({ comment: "提交时间" })
    timeSubmit!: Date;

  @Index({ name: "time_start" })
  @Property({ comment: "开始时间" })
    timeStart!: Date;

  @Index({ name: "time_end" })
  @Property({ comment: "结束时间" })
    timeEnd!: Date;

  @Property({ columnType: "int(10)", comment: "使用GPU数。来自gres_req字段" })
    gpu!: number;

  @Property({ columnType: "int unsigned", comment: "申请CPU数tres_req" })
    cpusReq!: number;

  @Property({ columnType: "int unsigned", comment: "申请的内存，单位MB，来自tres_req" })
    memReq!: number;

  @Property({ columnType: "int unsigned", comment: "申请节点数,tres_req" })
    nodesReq!: number;

  @Property({ columnType: "int unsigned", comment: "分配CPU数tres_alloc" })
    cpusAlloc!: number;

  @Property({ columnType: "int unsigned", comment: "分配的内存，单位MB，来自tres_alloc" })
    memAlloc!: number;

  @Property({ columnType: "int unsigned", comment: "分配节点数tres_alloc" })
    nodesAlloc!: number;

  @Property({ columnType: "int unsigned", comment: "作业时间限制" })
    timelimit!: number;

  @Index({ name: "time_used" })
  @Property({ columnType: "bigint unsigned", comment: "作业执行时间" })
    timeUsed!: number;

  @Index({ name: "time_wait" })
  @Property({ columnType: "bigint unsigned", comment: "作业等待时间" })
    timeWait!: number;

  @Property({ length: 255, comment: "QOS" })
    qos!: string;

  @Property({ columnType: "timestamp", defaultRaw: "CURRENT_TIMESTAMP", comment: "记录时间" })
    recordTime!: Date;
}

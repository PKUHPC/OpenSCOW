import { Entity, Index, PrimaryKey, Property } from "@mikro-orm/core";
import { Decimal } from "@scow/lib-decimal";
import type { OriginalJob } from "src/entities/OriginalJob";
import { DECIMAL_DEFAULT_RAW, DecimalType } from "src/utils/decimal";

const UNKNOWN_PRICE_ITEM = "UNKNOWN";

export interface JobPriceInfo {
  tenant: { billingItemId: string; price: Decimal; } | undefined;
  account: { billingItemId: string; price: Decimal; } | undefined;
}

@Entity()
export class JobInfo {

  @PrimaryKey()
    biJobIndex!: number;

  @Property({ index: "idJob" })
    idJob!: number;

  @Property({ length: 20, comment: "账户", index: "account" })
    account!: string;

  @Property({ length: 20, comment: "用户名", index: "user" })
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

  @Property({ comment: "结束时间", index: "time_end" })
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

  @Index({ name: "record_time" })
  @Property({ columnType: "timestamp", defaultRaw: "CURRENT_TIMESTAMP", comment: "记录时间" })
    recordTime!: Date;

  @Property()
    tenant: string;

  @Property({ default: UNKNOWN_PRICE_ITEM })
    accountBillingItemId: string;

  @Property({ default: UNKNOWN_PRICE_ITEM })
    tenantBillingItemId: string;

  @Property({ type: DecimalType, defaultRaw: DECIMAL_DEFAULT_RAW })
    tenantPrice: Decimal = new Decimal(0);

  @Property({ type: DecimalType, defaultRaw: DECIMAL_DEFAULT_RAW })
    accountPrice: Decimal = new Decimal(0);


  constructor(
    job: OriginalJob,
    tenant: string | undefined,
    jobPriceInfo: JobPriceInfo,
  ) {
    this.biJobIndex = job.biJobIndex;
    this.idJob = job.idJob;

    this.account = job.account;
    this.tenant = tenant ?? "";

    this.user = job.user;
    this.partition = job.partition;
    this.nodelist = job.nodelist;
    this.jobName = job.jobName;
    this.cluster = job.cluster;
    this.gpu = job.gpu;
    this.cpusReq = job.cpusReq;
    this.memReq = job.memReq;
    this.nodesReq = job.nodesReq;
    this.cpusAlloc = job.cpusAlloc;
    this.memAlloc = job.memAlloc;
    this.nodesAlloc = job.nodesAlloc;
    this.timelimit = job.timelimit;
    this.timeUsed = job.timeUsed;
    this.timeWait = job.timeWait;
    this.qos = job.qos;

    this.tenantPrice = jobPriceInfo.tenant?.price ?? new Decimal(0);
    this.tenantBillingItemId = jobPriceInfo.tenant?.billingItemId ?? UNKNOWN_PRICE_ITEM;
    this.accountPrice = jobPriceInfo.account?.price ?? new Decimal(0);
    this.accountBillingItemId = jobPriceInfo.tenant?.billingItemId ?? UNKNOWN_PRICE_ITEM;

    this.recordTime = job.recordTime;
    this.timeSubmit = job.timeSubmit;
    this.timeStart = job.timeStart;
    this.timeEnd = job.timeEnd;
  }
}

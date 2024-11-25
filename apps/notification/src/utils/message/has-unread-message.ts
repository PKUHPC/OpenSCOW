import { NoticeType } from "src/models/notice-type";
import { validateToken } from "src/server/auth/token";
import { SenderType } from "src/server/entities/Message";
import { ReadStatus, TargetType } from "src/server/entities/UserMessageRead";

import { forkEntityManager } from "../get-orm";

export const hasUnreadMessage = async (token: string) => {
  const info = await validateToken(token);

  if (!info) {
    throw new Error("UNAUTHORIZED");
  }

  const em = await forkEntityManager();
  const knex = em.getConnection().getKnex();

  // 构建子查询：从 message_targets 表获取符合条件的 message_id
  const mtSubquery = knex("message_targets as mt")
    .select("mt.message_id")
    .where(function() {
      this.where("mt.notice_types", "like", `%${NoticeType.SITE_MESSAGE}%`)
        .andWhere(function() {
          this.where("mt.target_type", TargetType.FULL_SITE)
            // 暂时没有通过租户和账户查询的需求
            // .orWhere(function() {
            //   this.where('mt.target_type', TargetType.TENANT)
            //     .andWhere('mt.target_id', info.tenant);
            // })
            // .orWhere(function() {
            //   this.where('mt.target_type', TargetType.ACCOUNT)
            //     .andWhere('mt.target_id', 'in', info.accountAffiliations.map(a => a.accountName));
            // })
            .orWhere(function() {
              this.where("mt.target_type", TargetType.USER)
                .andWhere("mt.target_id", info.identityId);
            });
        });
    });

  // 构建子查询：从 messages 表获取 sender_type = PLATFORM_ADMIN 的 message_id
  const mSubquery = knex("messages as m")
    .select("m.id as message_id")
    .where("m.sender_type", SenderType.PLATFORM_ADMIN);

  // 使用 UNION 合并两个子查询
  const unionSubquery = knex.union([
    mtSubquery,
    mSubquery,
  ], true).as("message_ids");

  // 构建最终查询
  const result = await knex("messages as m")
    // 左连接 user_message_read 表，仅限于当前用户的记录
    .leftJoin("user_message_read as umr", function() {
      this.on("m.id", "=", "umr.message_id")
        .andOn("umr.user_id", "=", knex.raw("?", [info.identityId]))
        .andOn("umr.status", "=", knex.raw("?", [ReadStatus.UNREAD]))
        .andOn("umr.is_deleted", "=", knex.raw("?", [false]));
    })
    // 筛选符合条件的 message_id
    .whereIn("m.id", knex.select("message_id").from(unionSubquery))
    .limit(1)
    .select("m.*");

  return result.length > 0;
};


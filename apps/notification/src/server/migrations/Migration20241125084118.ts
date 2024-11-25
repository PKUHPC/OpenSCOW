/* eslint-disable @stylistic/max-len */
import { Migration } from "@mikro-orm/migrations";

export class Migration20241125084118 extends Migration {

  override async up(): Promise<void> {
    this.addSql("alter table `user_message_read` modify `is_deleted` tinyint(1) not null default false, modify `created_at` DATETIME(6) not null default CURRENT_TIMESTAMP, modify `updated_at` DATETIME(6) not null default CURRENT_TIMESTAMP;");
    this.addSql("alter table `user_message_read` add unique `idx_user_message_unique`(`user_id`, `message_id`);");
  }

  override async down(): Promise<void> {
    this.addSql("alter table `user_message_read` drop index `idx_user_message_unique`;");

    this.addSql("alter table `user_message_read` modify `is_deleted` tinyint(1) not null, modify `created_at` DATETIME(6) not null, modify `updated_at` DATETIME(6) not null;");
  }

}

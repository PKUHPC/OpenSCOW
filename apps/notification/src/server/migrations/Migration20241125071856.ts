import { Migration } from "@mikro-orm/migrations";

export class Migration20241125071856 extends Migration {

  override async up(): Promise<void> {
    this.addSql("alter table `user_message_read` modify `is_deleted` tinyint(1) not null default false;");
    this.addSql("alter table `user_message_read` add unique `idx_user_message_unique`(`user_id`, `message_id`);");
  }

  override async down(): Promise<void> {
    this.addSql("alter table `user_message_read` drop index `idx_user_message_unique`;");

    this.addSql("alter table `user_message_read` modify `is_deleted` tinyint(1) not null;");
  }

}

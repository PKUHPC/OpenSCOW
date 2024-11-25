import { Migration } from "@mikro-orm/migrations";

export class Migration20241125062110 extends Migration {

  override async up(): Promise<void> {
    this.addSql("alter table `user_message_read` add unique `idx_user_message_unique`(`user_id`, `message_id`);");
  }

  override async down(): Promise<void> {
    this.addSql("alter table `user_message_read` drop index `idx_user_message_unique`;");
  }

}

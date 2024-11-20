import { Migration } from "@mikro-orm/migrations";

export class Migration20241120012334 extends Migration {

  override async up(): Promise<void> {
    this.addSql("alter table `message_targets` add index `target_type_target_id_idx`(`target_type`, `target_id`);");
  }

  override async down(): Promise<void> {
    this.addSql("alter table `message_targets` drop index `target_type_target_id_idx`;");
  }

}

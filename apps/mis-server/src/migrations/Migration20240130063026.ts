import { Migration } from '@mikro-orm/migrations';

export class Migration20240130063026 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `account` add `block_threshold_amount` DECIMAL(19,4) not null default 0.0000;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `account` drop column `block_threshold_amount`;');
  }

}

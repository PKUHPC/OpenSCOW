import { Migration } from '@mikro-orm/migrations';

export class Migration20240202054612 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `account` add `block_threshold_amount` DECIMAL(19,4) null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `account` drop column `block_threshold_amount`;');
  }

}

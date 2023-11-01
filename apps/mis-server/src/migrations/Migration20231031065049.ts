import { Migration } from '@mikro-orm/migrations';

export class Migration20231031065049 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `account` add `create_time` DATETIME(6) null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `account` drop `create_time`;');
  }

}

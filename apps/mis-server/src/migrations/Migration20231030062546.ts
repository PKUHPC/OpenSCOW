import { Migration } from '@mikro-orm/migrations';

export class Migration20231030062546 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `account` add `create_time` DATETIME(6) null default current_timestamp(6);');
  }

  async down(): Promise<void> {
    this.addSql('alter table `account` drop `create_time`;');
  }

}

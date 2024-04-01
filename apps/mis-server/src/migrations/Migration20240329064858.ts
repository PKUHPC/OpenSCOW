import { Migration } from '@mikro-orm/migrations';

export class Migration20240329064858 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `user` add `unicom_id` varchar(255) null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `user` drop column `unicom_id`;');
  }

}

import { Migration } from '@mikro-orm/migrations';

export class Migration20240412023431 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `user` add `country` varchar(255) null, add `phone` varchar(255) null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `user` drop column `country`;');
    this.addSql('alter table `user` drop column `phone`;');
  }

}

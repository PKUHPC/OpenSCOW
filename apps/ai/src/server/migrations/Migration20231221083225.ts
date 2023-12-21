import { Migration } from '@mikro-orm/migrations';

export class Migration20231221083225 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `image` add `shared_path` varchar(255) null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `image` drop `shared_path`;');
  }

}

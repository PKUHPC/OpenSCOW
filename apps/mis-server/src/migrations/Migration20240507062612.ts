import { Migration } from '@mikro-orm/migrations';

export class Migration20240507062612 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `account_whitelist` add `expiration_date` datetime not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `account_whitelist` drop column `expiration_date`;');
  }

}

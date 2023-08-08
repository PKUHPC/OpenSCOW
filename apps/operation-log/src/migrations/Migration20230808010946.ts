import { Migration } from '@mikro-orm/migrations';

export class Migration20230808010946 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `operation_log` modify `meta_data` json null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `operation_log` modify `meta_data` varchar(255) not null;');
  }

}

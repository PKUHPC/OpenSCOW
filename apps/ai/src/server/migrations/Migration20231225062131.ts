import { Migration } from '@mikro-orm/migrations';

export class Migration20231225062131 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `modal` modify `algorithm_framework` varchar(255) null comment \'algorithm algorithmFramework\', modify `algorithm_name` varchar(255) null comment \'algorithm name\';');
  }

  async down(): Promise<void> {
    this.addSql('alter table `modal` modify `algorithm_framework` varchar(255) not null comment \'algorithm algorithmFramework\', modify `algorithm_name` varchar(255) not null comment \'algorithm name\';');
  }

}

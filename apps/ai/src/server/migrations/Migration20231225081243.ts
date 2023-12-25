import { Migration } from '@mikro-orm/migrations';

export class Migration20231225081243 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `modal_version` modify `version_description` varchar(255) null, modify `algorithm_version` varchar(255) null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `modal_version` modify `version_description` varchar(255) not null, modify `algorithm_version` varchar(255) not null;');
  }

}

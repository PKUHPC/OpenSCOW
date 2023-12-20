import { Migration } from '@mikro-orm/migrations';

export class Migration20231220075705 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `dataset` modify `description` varchar(255) null;');

    this.addSql('alter table `dataset_version` modify `version_description` varchar(255) null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `dataset` modify `description` varchar(255) not null;');

    this.addSql('alter table `dataset_version` modify `version_description` varchar(255) not null;');
  }

}

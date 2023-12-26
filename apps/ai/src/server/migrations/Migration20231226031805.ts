import { Migration } from '@mikro-orm/migrations';

export class Migration20231226031805 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `algorithm_version` add `private_path` varchar(255) not null;');
    this.addSql('alter table `algorithm_version` drop `shared_path`;');

    this.addSql('alter table `dataset_version` add `private_path` varchar(255) not null;');
    this.addSql('alter table `dataset_version` drop `shared_path`;');

    this.addSql('alter table `image` add `source_path` varchar(255) not null;');
    this.addSql('alter table `image` drop `shared_path`;');

    this.addSql('alter table `modal_version` add `private_path` varchar(255) not null;');
    this.addSql('alter table `modal_version` drop `shared_path`;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `algorithm_version` add `shared_path` varchar(255) null;');
    this.addSql('alter table `algorithm_version` drop `private_path`;');

    this.addSql('alter table `dataset_version` add `shared_path` varchar(255) null;');
    this.addSql('alter table `dataset_version` drop `private_path`;');

    this.addSql('alter table `image` add `shared_path` varchar(255) null;');
    this.addSql('alter table `image` drop `source_path`;');

    this.addSql('alter table `modal_version` add `shared_path` varchar(255) null;');
    this.addSql('alter table `modal_version` drop `private_path`;');
  }

}

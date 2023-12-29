import { Migration } from '@mikro-orm/migrations';

export class Migration20231229033421 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `algorithm` drop index `algorithm_name_unique`;');

    this.addSql('alter table `dataset` drop index `dataset_name_unique`;');

    this.addSql('alter table `image` drop index `image_name_unique`;');

    this.addSql('alter table `modal` drop index `modal_name_unique`;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `algorithm` add unique `algorithm_name_unique`(`name`);');

    this.addSql('alter table `dataset` add unique `dataset_name_unique`(`name`);');

    this.addSql('alter table `image` add unique `image_name_unique`(`name`);');

    this.addSql('alter table `modal` add unique `modal_name_unique`(`name`);');
  }

}

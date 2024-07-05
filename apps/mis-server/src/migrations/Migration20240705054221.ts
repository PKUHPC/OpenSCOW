import { Migration } from '@mikro-orm/migrations';

export class Migration20240705054221 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `account` modify `state` enum(\'NORMAL\', \'FROZEN\', \'BLOCKED_BY_ADMIN\', \'DELETED\') not null default \'NORMAL\' comment \'NORMAL, FROZEN, BLOCKED_BY_ADMIN, DELETED\';');

    this.addSql('alter table `user` add `state` enum(\'NORMAL\', \'DELETED\') not null default \'NORMAL\' comment \'NORMAL, DELETED\', add `delete_remark` varchar(255) null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `account` modify `state` enum(\'NORMAL\', \'FROZEN\', \'BLOCKED_BY_ADMIN\') not null default \'NORMAL\' comment \'NORMAL, FROZEN, BLOCKED_BY_ADMIN\';');

    this.addSql('alter table `user` drop column `state`, drop column `delete_remark`;');
  }

}

import { Migration } from '@mikro-orm/migrations';
import { clusterIdMap } from "src/config/clusters";

export class Migration20221213020347 extends Migration {

  async up(): Promise<void> {
    Object.entries(clusterIdMap).forEach(([prev, curr]) => {
      if (prev === curr) { return; }
      this.addSql(`update \`job_info\` set \`cluster\` = '${curr}' where \`cluster\` = '${prev}';`);
    });
  }

  async down(): Promise<void> {
    Object.entries(clusterIdMap).forEach(([prev, curr]) => {
      if (prev === curr) { return; }
      this.addSql(`update \`job_info\` set \`cluster\` = '${prev}' where \`cluster\` = '${curr}';`);
    });
  }

}

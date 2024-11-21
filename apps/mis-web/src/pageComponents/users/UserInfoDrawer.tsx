import { formatDateTime } from "@scow/lib-web/build/utils/datetime";
import { Descriptions, Drawer } from "antd";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { FullUserInfo } from "src/models/User";


interface Props {
  open: boolean;
  item: Partial<FullUserInfo> | undefined;
  onClose: () => void;
}

const p = prefix("pageComp.user.userInfoDrawer.");

export const UserInfoDrawer: React.FC<Props> = (props) => {

  const t = useI18nTranslateToString();

  const drawerItems = [
    [t(p("id")), "id"],
    [t(p("name")), "name"],
    [t(p("email")), "email"],
    [t(p("phone")), "phone"],
    [t(p("organization")), "organization"],
    [t(p("tenant")), "tenant"],
    [t(p("comment")), "adminComment"],
    [t(p("createTime")), "createTime", formatDateTime],
  ] as (
  | [string, keyof FullUserInfo, (v: any) => string]
  )[];


  const { item, onClose, open } = props;

  return (
    <Drawer
      width={500}
      placement="right"
      onClose={onClose}
      open={open}
      title={t(p("detail"))}
    >
      {
        item ? (
          <Descriptions
            column={1}
            bordered
            size="small"
          >
            {drawerItems.map((([label, key, format]) => (
              <Descriptions.Item key={item.id} label={label}>
                {format ? format(item[key]) : (item[key] ?? "") as string}
              </Descriptions.Item>
            ))).filter((x) => x)}
          </Descriptions>
        ) : undefined }
    </Drawer>
  );
};

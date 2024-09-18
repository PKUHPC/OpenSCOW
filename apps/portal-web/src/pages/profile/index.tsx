/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { Descriptions, Typography } from "antd";
import { NextPage } from "next";
import { requireAuth } from "src/auth/requireAuth";
import { ModalButton } from "src/components/ModalLink";
import { Section } from "src/components/Section";
import { Localized, useI18nTranslateToString } from "src/i18n";
import { ChangePasswordModal } from "src/pageComponents/profile/ChangePasswordModal";
import { antdBreakpoints } from "src/styles/constants";
import { publicConfig } from "src/utils/config";
import { Head } from "src/utils/head";
import { styled } from "styled-components";

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
`;

const Part = styled(Section)`
  min-width: 400px;
  max-width: 600px;
  flex: 1;
  margin: 0 8px 16px 0;
  @media (min-width: ${antdBreakpoints.md}px) {
    margin: 0 16px 32px 0;
  }
`;

const TitleText = styled(Typography.Title)`
&& {
  width: 100vw;
  font-weight: 700;
  font-size: 24px;
  padding: 0 0 10px 20px;
  margin-left: -25px;
  border-bottom: 1px solid #ccc;
  @media (min-width: ${antdBreakpoints.md}px) {
    padding: 0 0 20px 30px;
  }
}
`;

const ChangePasswordModalButton = ModalButton(ChangePasswordModal, { type: "link" });


export const ProfilePage: NextPage = requireAuth(() => true)(({ userStore: { user } }) => {

  const t = useI18nTranslateToString();

  return (
    <Container>
      <Head title={t("pages.profile.title")} />
      <TitleText>
        <Localized id="pages.profile.userInfo"></Localized>
      </TitleText>
      <Part title>
        <Descriptions
          column={1}
          labelStyle={{ paddingLeft:"10px", marginBottom:"10px" }}
          contentStyle={{ paddingLeft:"10px" }}
        >
          <Descriptions.Item label={t("pages.profile.identityId")}>
            {user.identityId}
          </Descriptions.Item>
          <Descriptions.Item label={t("pages.profile.name")}>
            {user.name}
          </Descriptions.Item>
        </Descriptions>
      </Part>
      {
        publicConfig.ENABLE_CHANGE_PASSWORD ? (
          <>
            <TitleText>
              <Localized id="pages.profile.changePassword"></Localized>
            </TitleText>
            <Part title>
              <Descriptions
                column={1}
                labelStyle={{ paddingLeft:"10px", paddingTop:"5px" }}
                contentStyle={{ paddingLeft:"10px" }}
              >
                <Descriptions.Item label={t("pages.profile.loginPassword")}>
                  <span style={{ width:"200px" }}>********</span>
                  <ChangePasswordModalButton>
                    <Localized id="pages.profile.changePassword"></Localized>
                  </ChangePasswordModalButton>
                </Descriptions.Item>
              </Descriptions>
            </Part>
          </>
        ) : undefined
      }
    </Container>
  );
});

export default ProfilePage;

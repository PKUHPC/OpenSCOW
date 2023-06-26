/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * SCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { Select } from "antd";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { parseCookies, setCookie } from "nookies";
import { useEffect, useState } from "react";
import styled from "styled-components";


const Container = styled.div`
  white-space: nowrap;
`;

export const LanguageSwitcher = () => {

  const [selectedLanguage, setSelectedLanguage] = useState("");
  const { i18n } = useTranslation("translations");

  const router = useRouter();

  useEffect(() => {
    const cookies = parseCookies();
    const initialLanguage = cookies.language;
    if (initialLanguage) {
      setSelectedLanguage(initialLanguage);
      changeLng(initialLanguage);
    } else {
      const defaultLanguage = "zh_cn";
      setSelectedLanguage(defaultLanguage);
      setLanguageCookie(defaultLanguage);
      changeLng(defaultLanguage);
    }
  }, [router]);

  const setLanguage = async (newLocale: string) => {
    setSelectedLanguage(newLocale);
    setLanguageCookie(newLocale);
    await changeLng(newLocale);
  };

  const changeLng = async (newLocale: string) => {
    return await i18n.changeLanguage(newLocale, async () => {
      await i18n.reloadResources();
    });
  };

  const setLanguageCookie = (newLocale: string) => {
    setCookie(null, "language", newLocale, {
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });
    router.replace(router.asPath);
  };

  return (
    <Container>
      <Select value={selectedLanguage} onChange={(value) => setLanguage(value)}>
        <Select.Option value="zh_cn">CN 简体中文</Select.Option>
        <Select.Option value="en">US English</Select.Option>
      </Select>
    </Container>
  );
};



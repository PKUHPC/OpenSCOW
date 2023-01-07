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

import { joinWithUrl, normalizePathnameWithQuery } from "src/url";

it.each([
  [["http://example.com", "foo"], "http://example.com/foo"],
  [["example.com", "foo"], "example.com/foo"],
  [["http://example.com/test", "foo"], "http://example.com/test/foo"],
  [["example.com/test", "foo"], "example.com/test/foo"],
  [["http://example.com:8080/test?ok=3", "foo"], "http://example.com:8080/test/foo?ok=3"],
  [["example.com:8080/test?test=1", "foo", "test/32"], "example.com:8080/test/foo/test/32?test=1"],
  [["/example/test", "foo/test"], "/example/test/foo/test"],
])("should join %o to %o", ([base, ...paths], expected) => {
  expect(joinWithUrl(base, ...paths)).toBe(expected);
});


it.each([
  ["/test//test", "/test/test"],
  ["/test//test/", "/test/test/"],
  ["/test//test?test=ok", "/test/test?test=ok"],
])("should normalize %o to %o", (pathname, expected) => {
  expect(normalizePathnameWithQuery(pathname)).toBe(expected);
});

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

// 小圆点组件
import { styled } from "styled-components";

const Dot = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  border-radius: 50%;
  display:inline-block;
`;

interface BulletProps {
  style?: React.CSSProperties;
}


const Bullet: React.FC<BulletProps> = ({ style }) => (
  <Dot style={style}>
  </Dot>
);

export default Bullet;

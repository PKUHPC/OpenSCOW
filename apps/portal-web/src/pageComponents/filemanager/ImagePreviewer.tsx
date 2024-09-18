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

import { Image, Spin } from "antd";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { styled } from "styled-components";

const FullScreenCentered = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.3);
  z-index: 1000;
`;

interface PreviewImageProps {
  visible: boolean;
  src: string;
  scaleStep: number;
}

interface Props {
  previewImage: PreviewImageProps;
  setPreviewImage: Dispatch<SetStateAction<PreviewImageProps>>
}

export const ImagePreviewer: React.FC<Props> = ({ previewImage, setPreviewImage }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (previewImage.visible) {
      setLoading(true);
    }
  }, [previewImage.visible]);

  const handleImageLoad = () => {
    setLoading(false);
  };

  return (
    <>
      {loading && previewImage.visible && (
        <FullScreenCentered>
          <Spin size="large" />
        </FullScreenCentered>
      )}
      <Image
        style={{ display: "none" }}
        src={previewImage.src}
        preview={{
          visible: previewImage.visible,
          scaleStep: previewImage.scaleStep,
          onVisibleChange: (vis) => {
            setPreviewImage({
              ...previewImage,
              visible: false,
            });

            if (!vis) {
              setLoading(false);
            }
          },
        }}
        onLoad={handleImageLoad}
        onError={() => setLoading(false) }
      />
    </>
  );
};

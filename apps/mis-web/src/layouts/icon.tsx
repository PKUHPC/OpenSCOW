import AntdIcon from "@ant-design/icons";
import Image from "next/image";

interface Props {
  src: any;
  alt: string;
}

export function NavIcon({ src, alt }: Props) {
  return (
    <AntdIcon
      component={({ width, height, style, className, fill }) => (
        <Image
          src={src}
          alt={alt}
          style={{
            width,
            height,
            fill,
            ...style,
          }}
          className={className}
        />
      )}
    />

  );
}

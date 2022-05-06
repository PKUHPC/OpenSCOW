import NextHead from "next/head";

interface Props {
  title: string;
}

export const Head: React.FC<Props> = ({ title, children }) => {
  return (
    <NextHead>
      <title>{title} - scow</title>
      {children}
    </NextHead>
  );
};

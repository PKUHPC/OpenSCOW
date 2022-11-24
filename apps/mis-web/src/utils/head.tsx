import NextHead from "next/head";

type Props = React.PropsWithChildren<{
  title: string;
}>;

export const Head: React.FC<Props> = ({ title, children }) => {
  return (
    <NextHead>
      <title>{`${title} - scow`}</title>
      {children}
    </NextHead>
  );
};

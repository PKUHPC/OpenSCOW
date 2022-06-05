import { AppServer } from "@scow/config/build/appConfig/appServer";
import { parsePlaceholder } from "@scow/config/build/parse";
import Link from "next/link";
import { useMemo } from "react";
import { AppSession_RunInfo } from "src/generated/portal/app";

export interface Props {
  connectProps: AppServer["connect"] | undefined;
  runInfo: AppSession_RunInfo;
  sessionId: string;
}

export const ConnectTopAppLink: React.FC<Props> = ({
  connectProps,
  sessionId,
  runInfo: { host, password, port },
}) => {

  if (!connectProps) {
    return (
      <span>
        不支持连接到此应用
      </span>
    );
  }


  const { path, query, formData } = useMemo(() => {
    const interpolatedValues = { HOST: host, PASSWORD: password, PORT: port };
    const path = parsePlaceholder(connectProps.path, interpolatedValues);
    function interpolateValues(obj: Record<string, string>) {
      return Object.keys(obj).reduce((prev, curr) => {
        prev[curr] = parsePlaceholder(obj[curr], interpolatedValues);
        return prev;
      }, {});
    }
    const query = interpolateValues(connectProps.query);
    const formData =  connectProps.formData ? interpolateValues(connectProps.formData) : undefined;

    return { path, query, formData };
  }, [host, password, port]);

  const pathname = `/api/proxy/${host}/${port}${path}`;

  if (connectProps.method === "GET") {
    return (
      <Link
        href={{ pathname, query }}
        passHref
      >
        <a target="_blank">
          连接
        </a>
      </Link>
    );
  } else {
    const id = `connect-${sessionId}`;
    return (
      <form
        id={id}
        action={pathname + "?" + new URLSearchParams(query).toString()}
        method="POST" target="_blank"
      >
        {
          formData
            ? Object.keys(formData).map((k) => (
              <input key={k} type="hidden" name={k} value={formData[k]} />
            )) : undefined
        }
        <a type="submit" onClick={() => {
          (document.getElementById(id) as HTMLFormElement)?.submit();
        }}
        >
          连接
        </a>
      </form>
    );
  }
};

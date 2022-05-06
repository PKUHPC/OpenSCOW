export {};
// import { Select, Spin } from "antd";
// import React, { useState } from "react";
// import { api } from "src/apis";
// import { debounce } from "src/utils/debounce";
// import { useHttpRequest } from "src/utils/http";

// interface Props {
//   value?: string;
//   onChange?: (a: string) => void;
// }

// export const AccountSelector: React.FC<Props> = ({ value, onChange }) => {

//   const [call, isLoading] = useHttpRequest();
//   const [candidates, setCandidates] = useState<AccountSearchResult[]>([]);

//   const search = debounce(async (value: string) => {
//     if (!value) { return []; }
//     setCandidates([]);
//     await call(async () => {
//       const resp = await api.searchAccount({ query: { searchWord: value } });
//       setCandidates(resp.results);
//     });
//   });

//   return (
//     <Select
//       showSearch
//       placeholder="选择账户，可输入进行搜索"
//       value={value ? `${value.name} (${value.id})` : ""}
//       notFoundContent={isLoading ? <Spin size="small" /> : null}
//       filterOption={false}
//       onSearch={search}
//       onSelect={(v) => {
//         onChange?.(candidates.find((x) => (x.id + "") === v)!);
//       }}
//       style={{ width: "100%" }}
//     >
//       {candidates.map((d) => (
//         <Select.Option key={d.id} value={d.id + ""}>
//           {d.name} ({d.id})
//         </Select.Option>
//       ))}
//     </Select>
//   );
// };

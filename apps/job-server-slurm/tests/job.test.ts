import { parseSbatchOutput } from "src/bl/submitJob";

it.each([
  ["Submitted batch job 34987", 34987],
])("parses job id from sbatch output", async (output, expected) => {
  expect(parseSbatchOutput(output)).toBe(expected);
});

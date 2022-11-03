import { parseDisplayId, parseListOutput, parseOtp } from "src/utils/turbovnc";

const startOutput = `
Desktop 'TurboVNC: login01:1 (2001213077)' started on display login01:1

One-Time Password authentication enabled.  Generating initial OTP ...
Full control one-time password: 67159149
Run '/opt/TurboVNC/bin/vncpasswd -o' from within the TurboVNC session or
    '/opt/TurboVNC/bin/vncpasswd -o -display :1' from within this shell
    to generate additional OTPs
Starting applications specified in ./xstartup
Log file is /nfs/2001213077/.vnc/login01:1.log
`;

it.each([
  [startOutput, 1],
])("parses display id from output", async (output, expected) => {
  expect(parseDisplayId(output)).toBe(expected);
});

it.each([
  ["Full control one-time password: 32582749", "32582749"],
  [startOutput, "67159149"],
])("parses OTP from output", async (output, expected) => {
  expect(parseOtp(output)).toBe(expected);
});

const listOutput = `
TurboVNC sessions:

X DISPLAY #     PROCESS ID      NOVNC PROCESS ID
:1\t\t21468
:2\t\t22284
`;

it.each([
  [listOutput, [1, 2]],
])("parses list", (output, expected) => {
  expect(parseListOutput(output)).toIncludeSameMembers(expected);
});


import { parseDisplayId, parseListOutput, parseOtp } from "src/services/VncService";

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

it("parses display id from output", async () => {

  const test = (output: string, expected: number) => {
    expect(parseDisplayId(output, pino())).toBe(expected);
  };

  test(startOutput, 1);

});

it("parses OTP from output", async () => {

  const test = (output: string, expected: string) => {
    expect(parseOtp(output, pino())).toBe(expected);
  };

  test("Full control one-time password: 32582749", "32582749");

  test(startOutput, "67159149");

});

it("parses list", async () => {
  const test = (output: string, expected: number[]) => {
    expect(parseListOutput(output)).toIncludeSameMembers(expected);
  };

  test(`
TurboVNC sessions:

X DISPLAY #     PROCESS ID      NOVNC PROCESS ID
:1\t\t21468
:2\t\t22284
`, [1, 2]);
});

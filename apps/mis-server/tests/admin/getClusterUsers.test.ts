import { parseClusterUsers } from "src/utils/slurm";


const dataStr = "a_user1\nuser1 : allowed!\nuser2 : blocked!\n\naccount2\nuser2:allowed!\nuser3:blocked!\n";

it("test whether the string from 'slurm.sh -l all' can be parsed successfully", async () => {
  const result = parseClusterUsers(dataStr);

  expect(result).toStrictEqual({ accounts: [
    {
      accountName: "a_user1",
      users: [{ userId: "user1", state: "allowed!" }, { userId: "user2", state: "blocked!" }],
      owner: "user1",
    },
    {
      accountName: "account2",
      users: [{ userId: "user2", state: "allowed!" }, { userId: "user3", state: "blocked!" }],
    },
  ],
  users: [ 
    { userId: "user1", userName: "user1", accounts: [ "a_user1" ]}, 
    { userId: "user2", userName: "user2", accounts: [ "a_user1", "account2" ]}, 
    { userId: "user3", userName: "user3", accounts: [ "account2" ]},
  ]});
});
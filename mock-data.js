const users = [
  { id: 1, name: "User 1", balance: 1000, authToken: "user1token" },
  { id: 2, name: "User 2", balance: 1500, authToken: "user2token" },
  { id: 3, name: "Escrow Account", balance: 0, authToken: "escrowtoken" },
];

const transactions = [];

module.exports = { users, transactions };

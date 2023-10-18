const express = require("express");
const bodyParser = require("body-parser");
const { users, transactions } = require("./mock-data");

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.json("welcome to bank of Kigali ");
});

// List all users
app.get("/users", (req, res) => {
  res.json(users);
});

// generate the users aouthorisation token

app.post("/generate-token/:userId", (req, res) => {
  const userId = parseInt(req.params.userId);
  const user = users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  const authToken = user.authToken;

  res.json({ authToken });
});

app.post("/transactions", (req, res) => {
  const { fromUserId, toUserId, amount, authToken, condition } = req.body;
  const fromUser = users.find((user) => user.id === fromUserId);
  const escrowAccount = users.find((user) => user.id === 3);
  if (
    !fromUser ||
    fromUser.authToken !== authToken ||
    fromUser.balance < amount
  ) {
    return res
      .status(400)
      .json({ error: "Invalid transaction insufficieant funds" });
  }

  // Transfer the amount to the escrow account
  fromUser.balance -= amount;
  escrowAccount.balance += amount;

  //conditions for releasing funds from escrow
  if (condition === "release") {
    //valid release condition
    const toUser = users.find((user) => user.id === toUserId);
    if (!toUser) {
      return res.status(404).json({ error: "Recipient not found" });
    }

    // Transfer the amount from the escrow account to the recipient
    escrowAccount.balance -= amount;
    toUser.balance += amount;

    transactions.push({
      fromUserId,
      toUserId,
      amount,
      condition: "released",
      id: Math.floor(Math.random() * 10),
    });
    return res.json({ message: "Transaction successful" });
  }

  // If the release condition is not met, the funds remain in escrow
  transactions.push({
    from: fromUserId,
    to: toUserId,
    amount: amount,
    condition: "held",
    id: Math.floor(Math.random() * 10),
  });
  return res.json({ message: "Transaction held in escrow" });
});

app.post("/approve-transaction/:transactionId", (req, res) => {
  const { authToken } = req.body;
  const transactionId = parseInt(req.params.transactionId); 
  const transaction = transactions.find((t) => t.id === transactionId);

  // Ensure the transaction exists
  if (!transaction) {
    return res.status(404).json({ error: "Transaction not found" });
  }
  console.log(transaction);
  // Find the sender's user account
  const fromUser = users.find((user) => user.id === transaction.from);
  // Validate the user's authToken and check if the transaction is held and pending approval
  if (
    !fromUser ||
    fromUser.authToken !== authToken ||
    transaction.condition !== "held"
  ) {
    return res.status(400).json({ error: "Invalid transaction approval" });
  }

  // Transfer the amount from the escrow account to the receiving user
  const toUser = users.find((user) => user.id === transaction.to);
  fromUser.balance -= transaction.amount;
  toUser.balance += transaction.amount;

  // Update the transaction condition to 'released'
  transaction.condition = "released";

  res.json({ message: "Transaction approved and funds transferred" });
});

app.get("/transaction", (req, res) => {
  res.json(transactions);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

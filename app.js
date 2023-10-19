
import { swagger } from "./swagger.js";
import { users, transactions } from "./mock-data.js";
import swaggerUi from 'swagger-ui-express'
import multer from "multer";
import path from "path";
import bodyParser from "body-parser";
import express from 'express'


const app = express();

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swagger));
const port = 3000;

// picture i.e. 1 MB. it is optional
const maxSize = 1 * 1000 * 1000;

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + ".pdf");
  },
});

var upload = multer({
  storage: storage,
  limits: { fileSize: maxSize },
  fileFilter: function (req, file, cb) {
    // Set the filetypes to allow PDF files
    var filetypes = /pdf/;
    var mimetype = filetypes.test(file.mimetype);

    var extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }

    cb("Error: File upload only supports PDF files.");
  },
}).single("mypic");

app.use(bodyParser.json());

app.all("/app", (req, res) => {
  res.json("welcome to bank of Kigali ");
});

// List all users
app.get("/users", (req, res) => {
  res.json(users);
});

//Upload kyc

app.post("/upload/:id", (req, res) => {
  const kycid = parseInt(req.params.id);
  console.log(kycid);
  upload(req, res, (err) => {
    if (err) {
      res.status(400).json({ error: err });
    } else {
      // File uploaded successfully
      const updatedStatus = "kyc-uploaded";
      const user = users.find((user) => user.id === kycid);
      if (user) {
        user.kycstatus = updatedStatus;
      } else {
        console.log(`User with userid ${kycid} not found.`);
      }
      res.status(200).json({ message: "File uploaded successfully" });
    }
  });
});

// approve kyc  || cancel kyc

app.post("/kycstatus/:id", (req, res) => {
  const kycid = parseInt(req.params.id);
  const kycstatus = req.body.kycstatus;
  // console.log(kycid);
  // console.log(kycstatus);
  const user = users.find((user) => user.id === kycid);
  if (user) {
    user.kycstatus = kycstatus;
  } else {
    console.log(`User with userid ${kycid} not found.`);
  }
  res.status(200).json({ message: "Kyc updated successfully" });
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

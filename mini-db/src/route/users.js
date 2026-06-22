const express = require("express");

const router = express.Router();

const Database = require("../db/database.js");

const db = new Database(
  "./data/user.data.json"
);

router.post('/adduser', (req, res) => {
    const user = db.insert(req.body);

    res.status(201).json(user);
});

router.get("/getAlluser", (req, res) => {
  const users = db.read();

  res.status(200).json(users);
});

router.get("/user/:id", (req, res) => {
  const user = db.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      message: "User not found"
    });
  }

  res.json(user);
});
module.exports = router;
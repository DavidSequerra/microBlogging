const express = require("express");
const router = express.Router();
const { poolDB } = require("../postgresql");
const { poolDBlocal } = require("../postgreslocal");

router.use(require("cors")());


router.get("/", async (req, res) => {
  try {
      const result = await poolDBlocal("SELECT * FROM users");
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

router.get("/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const result = await poolDBlocal("SELECT * FROM users WHERE user_id =$1", [userId]);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await poolDBlocal(`SELECT * FROM users WHERE email = $1`, [
      email
    ]);
    if (password === result[0].password) {
      res.send(result)
    } else {
      res.status(401).send()
    }
  } catch (error) {
    console.log(error)
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { first_name, last_name, username, email, img, bio, password } = req.body;
    const result = await poolDBlocal(
      `
            INSERT INTO users
            (first_name, last_name, username, email, img, bio, password)
            VALUES
            ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
            `,
      [first_name, last_name, username, email, img, bio, password]
    );
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

router.put("/update/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const { first_name, last_name, email, username, img, bio, password } = req.body;
    const result = await poolDBlocal(
      `
        UPDATE users
        SET first_name = $1, last_name = $2, email = $3, username = $4, img = $5, bio = $6, password = $7
        WHERE user_id = $8
        RETURNING *
      `,
      [first_name, last_name, email, username, img, bio, password, userId]
    );
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
})

router.put("/updateKeyValue/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const { key, value } = req.body;
    const result = await poolDBlocal(
      `
        UPDATE users
        SET ${key} = $1
        WHERE user_id = $2
        RETURNING *
      `,
      [value, userId]
    );
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

module.exports = router;
const express = require("express");
const router = express.Router();
const { poolDB } = require("../postgresql");
const { poolDBlocal } = require("../postgreslocal");

router.use(require("cors")());

router.get("/:postId", async (req, res) => {
    const post_id = req.params.postId;
    const result = await poolDBlocal(
        `SELECT replies.*, users.username, users.img
            FROM replies
            JOIN users ON replies.user_id = users.user_id
            WHERE replies.post_id = $1 AND replies.parent_reply_id IS NULL
            ORDER BY replies.created_at DESC
        `,
        [post_id]
    );
    res.send(result);
});

router.get("/replyId/:replyId", async (req, res) => {
    const reply_id = req.params.replyId;
  if (reply_id) {
    try {
      const result = await poolDBlocal(
        `SELECT replies.*, users.username, users.img
            FROM replies
            JOIN users ON replies.user_id = users.user_id
            WHERE replies.parent_reply_id = $1
            ORDER BY replies.created_at ASC
        `,
        [reply_id]
      );
      res.send(result);
    } catch (error) {
      console.log(error);
    }
  } else {
    res.send({data: []})
  }
  
});

router.post("/newReply", async (req, res) => {
    const { post_id, parent_reply_id, content, user_id } = req.body;
  try {
    if (!parent_reply_id) {
      const result = await poolDBlocal(
        `INSERT INTO replies (post_id, content, user_id)
        VALUES ($1,$2,$3)
        RETURNING *
          `,
        [post_id, content, user_id]
      );
      res.send(result);
    } else {
        const result = await poolDBlocal(
          `INSERT INTO replies (post_id, parent_reply_id, content, user_id)
        VALUES ($1,$2,$3,$4)
        RETURNING *
          `,
          [post_id, parent_reply_id, content, user_id]
        );
        res.send(result);
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

router.delete("/:replyId", async (req, res) => {
  const { replyId } = req.params;
  const { userId } = req.query;

  if (!replyId || !userId) {
    return res.status(400).json({ message: "Missing replyId or userId" });
  }
  try {
    const result = await poolDBlocal(
      `DELETE FROM replies
          WHERE reply_id = $1
          AND user_id = $2
          `,
      [replyId, userId]
    );
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

module.exports = router;

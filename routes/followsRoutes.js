const express = require("express");
const router = express.Router();
const { poolDB } = require("../postgresql");
const { poolDBlocal } = require("../postgreslocal");

router.use(require("cors")());

router.get("/list/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const result = await poolDBlocal(
      `SELECT follows.*, blogs.title
      FROM follows
      JOIN blogs ON follows.blog_id = blogs.blog_id
      WHERE follows.user_id = $1
      ORDER BY follows.created_at DESC
      `,
      [userId]
    );
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});


router.get("/:userId/:blogId", async (req, res) => {
  const userId = req.params.userId;
  const blogId = req.params.blogId;
  try {
    const result = await poolDBlocal(
      `SELECT * FROM follows
      WHERE user_id = $1
      AND blog_id = $2
      `, [userId, blogId]
    );
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});


router.post("/:userId/:blogId", async (req, res) => {
  const userId = req.params.userId;
  const blogId = req.params.blogId;
  try {
    const checkFollowQuery = `SELECT * FROM follows WHERE user_id = $1 AND blog_id = $2`;
    const checkFollow = await poolDBlocal(checkFollowQuery,[userId, blogId]);

    if (checkFollow.length > 0) {
      await poolDBlocal(
        `DELETE FROM follows WHERE user_id = $1 AND blog_id = $2`,
        [userId, blogId]
      );
    } else {
      await poolDBlocal(
        `INSERT INTO follows (user_id, blog_id) 
            VALUES ($1, $2)`,
        [userId, blogId]
      );
    }
    const result = await poolDBlocal(checkFollowQuery, [userId, blogId]);
    res.send(result);
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ error: "Failed to toggle like" });
  }
});

module.exports = router;
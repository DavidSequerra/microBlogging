const express = require("express");
const router = express.Router();
const { poolDB } = require("../postgresql");
const { poolDBlocal } = require("../postgreslocal");

router.use(require("cors")());

router.get("/usersBlogs", async (req, res) => {
  try {
    const result = await poolDBlocal(
      `SELECT p.*, u.username, u.img, b.title
      FROM posts p
      JOIN users u ON p.user_id = u.user_id
      JOIN blogs b ON p.blog_id = b.blog_id
      ORDER BY p.created_at DESC
      `
    );
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

router.get("/:blogId", async (req, res) => {
  const blog_id = req.params.blogId;
  try {
    const result = await poolDBlocal(
      `SELECT p.*, u.username, u.img, b.title,
              (SELECT COUNT(*) FROM replies r WHERE r.post_id = p.post_id AND r.parent_reply_id IS NULL) AS reply_count
       FROM posts p
       JOIN users u ON p.user_id = u.user_id
       JOIN blogs b ON p.blog_id = b.blog_id
       WHERE p.blog_id = $1
       ORDER BY p.created_at DESC
      `,
      [blog_id]
    );
    res.send(result);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching posts" });
  }
});

router.post("/newPost", async (req, res) => {
  const { blog_id, user_id, content } = req.body;
  try {
    const result = await poolDBlocal(
      `INSERT INTO posts
      (blog_id, user_id, content)
      VALUES
      ($1,$2,$3)
      RETURNING *
      `,
      [blog_id, user_id, content]
    );
    res.send(result);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete("/:postId", async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.query;

  if (!postId || !userId) {
    return res.status(400).json({ message: "Missing replyId or userId" });
  }
  try {
    const result = await poolDBlocal(
      `DELETE FROM posts
          WHERE post_id = $1
          AND user_id = $2
          `,
      [postId, userId]
    );
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

module.exports = router;
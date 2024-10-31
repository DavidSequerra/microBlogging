const express = require("express");
const router = express.Router();
const { poolDB } = require("../postgresql");
const { poolDBlocal } = require("../postgreslocal");

router.use(require("cors")());

router.get("/", async (req, res) => {
  try {
    const result = await poolDBlocal("SELECT * FROM blogs");
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});
router.post("/infinite", async (req, res) => {
  const query = req.body.query || '';
  const pageNumber = req.body.pageNumber|| 1;
  const limit = 10;
  const offset = (pageNumber -1) * limit;
  try {
    const result = await poolDBlocal(
      `SELECT * FROM blogs
      WHERE title ILIKE $1
      LIMIT $2 OFFSET $3
      `,
      [`%${query}%`, limit, offset]
    );
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});
router.get("/list/:userId", async (req, res) => {
  const user_id = req.params.userId;
  try {
    const result = await poolDBlocal(
      `SELECT * FROM blogs
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [user_id]
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
      `SELECT * FROM blogs
      WHERE blog_id = $1
      ORDER BY created_at DESC
      `,
      [blog_id]
    );
    console.log(result);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

router.post("/:userId", async (req, res) => {
  const user_id = req.params.userId;
  const { title, description } = req.body;
  try {
    const result = await poolDBlocal(
      `INSERT INTO blogs
            (user_id, title, description)
            VALUES
            ($1, $2, $3)
            RETURNING *
            `,
      [user_id, title, description]
    );
    res.send(result);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete("/:blogId", async (req, res) => {
  const { blogId } = req.params;
  const { userId } = req.query;

  if (!blogId || !userId) {
    return res.status(400).json({ message: "Missing replyId or userId" });
  }
  try {
    const result = await poolDBlocal(
      `DELETE FROM blogs
          WHERE blog_id = $1
          AND user_id = $2
          `,
      [blogId, userId]
    );
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});


module.exports = router;
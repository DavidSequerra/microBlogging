const express = require("express");
const router = express.Router();
const { poolDB } = require("../postgresql");
const { poolDBlocal } = require("../postgreslocal");

router.use(require("cors")());

router.get("/:itemType/:itemId", async (req, res) => {
  const { itemType, itemId } = req.params;
  const { userId } = req.query;

  if (!userId) return res.status(400).json({ error: "User ID is required" });

  let itemColumn;
  switch (itemType) {
    case "blog":
      itemColumn = "blog_id";
      break;
    case "post":
      itemColumn = "post_id";
      break;
    case "reply":
      itemColumn = "reply_id";
      break;
    case "subReply":
      itemColumn = "reply_id";
      break;
    default:
      return res.status(400).json({ error: "Invalid item type" });
  }

  try {
    const likesQuery = `SELECT * FROM likes WHERE ${itemColumn} = $1`;
    const allLikes = await poolDBlocal(likesQuery, [itemId]);

    const userLikeQuery = `SELECT * FROM likes WHERE ${itemColumn} = $1 AND user_id = $2`;
    const userLike = await poolDBlocal(userLikeQuery, [itemId, userId]);

    res.send({ allLikes, userLike });
  } catch (error) {
    console.error("Error fetching likes data:", error);
    res.status(500).json({ error: "Failed to fetch likes data" });
  }
});

router.post("/postLike", async (req, res) => {
  const { userId, itemId, itemType } = req.body;

  if (!userId || !itemId || !itemType)
    return res
      .status(400)
      .json({ error: "User ID, item ID, and item type are required" });

  let itemColumn;
  switch (itemType) {
    case "blog":
      itemColumn = "blog_id";
      break;
    case "post":
      itemColumn = "post_id";
      break;
    case "reply":
      itemColumn = "reply_id";
      break;
    case "subReply":
      itemColumn = "reply_id";
      break;
    default:
      return res.status(400).json({ error: "Invalid item type" });
  }

  try {
    const userLikeQuery = `SELECT * FROM likes WHERE ${itemColumn} = $1 AND user_id = $2`;
    const userLikeResult = await poolDBlocal(userLikeQuery, [itemId, userId]);

    if (userLikeResult.length > 0) {
      const deleteLikeQuery = `DELETE FROM likes WHERE ${itemColumn} = $1 AND user_id = $2`;
      await poolDBlocal(deleteLikeQuery, [itemId, userId]);
    } else {
      const insertLikeQuery = `INSERT INTO likes (user_id, ${itemColumn}) 
            VALUES ($1, $2)`;
      await poolDBlocal(insertLikeQuery, [userId, itemId]);
    }
    const result = await poolDBlocal(userLikeQuery, [itemId, userId]);
    res.send(result);
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ error: "Failed to toggle like" });
  }
});

module.exports = router;

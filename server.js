const express = require("express");
const app = express();
const port = 3001;

const usersRoute = require("./routes/usersRoute");
const blogsRoute = require("./routes/blogsRoutes");
const postsRoute = require("./routes/postsRoutes");
const repliesRoute = require("./routes/repliesRoutes");
const likesRoute = require("./routes/likesRoutes");
const followsRoute = require("./routes/followsRoutes");

app.use(express.json());
app.use(require("cors")());

app.use("/users", usersRoute);
app.use("/blogs", blogsRoute);
app.use("/posts", postsRoute);
app.use("/replies", repliesRoute);
app.use("/likes", likesRoute);
app.use("/follows", followsRoute);


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

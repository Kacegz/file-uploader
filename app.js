const express = require("express");
const path = require("node:path");

const userRouter = require("./routes/router");

const app = express();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
await prisma.message.create({
  data: {
    content: "Hello, world!",
    authorId: 1,
  },
});

const messages = await prisma.message.findMany();
console.log(messages);
app.use(express.urlencoded({ extended: false }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use("/", userRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

import express from "express";
import cors from "cors";
import storyRouter from "./routes/story.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", storyRouter);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});

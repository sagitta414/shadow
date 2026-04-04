import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storyRouter from "./story";
import soundboardRouter from "./soundboard";
import plottwistRouter from "./plottwist";
import visitorsRouter from "./visitors";
import adminRouter from "./admin";
import { logEvent } from "../lib/eventLogger";

const router: IRouter = Router();

router.use((req, _res, next) => {
  if (req.method === "POST" && req.path.startsWith("/story/")) {
    logEvent(req);
  }
  next();
});

router.use(healthRouter);
router.use(storyRouter);
router.use(soundboardRouter);
router.use(plottwistRouter);
router.use(visitorsRouter);
router.use(adminRouter);

export default router;

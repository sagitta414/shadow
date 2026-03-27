import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storyRouter from "./story";
import soundboardRouter from "./soundboard";
import plottwistRouter from "./plottwist";
import visitorsRouter from "./visitors";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storyRouter);
router.use(soundboardRouter);
router.use(plottwistRouter);
router.use(visitorsRouter);

export default router;

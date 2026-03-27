import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storyRouter from "./story";
import soundboardRouter from "./soundboard";
import plottwistRouter from "./plottwist";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storyRouter);
router.use(soundboardRouter);
router.use(plottwistRouter);

export default router;

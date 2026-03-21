import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storyRouter from "./story";
import soundboardRouter from "./soundboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storyRouter);
router.use(soundboardRouter);

export default router;

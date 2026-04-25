import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import categoriesRouter from "./categories";
import productsRouter from "./products";
import galleryRouter from "./gallery";
import inquiriesRouter from "./inquiries";
import settingsRouter from "./settings";
import adminStatsRouter from "./adminStats";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(categoriesRouter);
router.use(productsRouter);
router.use(galleryRouter);
router.use(inquiriesRouter);
router.use(settingsRouter);
router.use(adminStatsRouter);
router.use(storageRouter);

export default router;

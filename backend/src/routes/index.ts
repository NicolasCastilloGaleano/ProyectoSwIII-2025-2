import { Router } from "express";
import usersRouter from "./users";

const router = Router();

router.use("/users", usersRouter);
// router.use("/products", productsRouter);
// router.use("/projects", projectsRouter);
// ...

export default router;

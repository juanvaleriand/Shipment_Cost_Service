import express from "express";
import DriverController from "../controllers/driver.controller";

const router = express.Router();

router.get("/v1/salary/drivers", DriverController.getDriverSalaries);

export default router;

import { Sequelize } from "sequelize-typescript";
import { Driver } from "../models/driver.model";
import { DriverAttendance } from "../models/driverAttendance.model";
import { Shipment } from "../models/shipment.model";
import { ShipmentCost } from "../models/shipmentCost.model";
import { VariableConfig } from "../models/variableConfig.model";
import dotenv from "dotenv";

dotenv.config();

const {
  NODE_ENV,
  DB_NAME,
  DB_USER,
  DB_PASS,
  DB_HOST,
  DB_PORT = "5432",
  TIMEZONE = "+07:00",
} = process.env;

if (!DB_NAME || !DB_USER || !DB_PASS || !DB_HOST || !DB_PORT) {
  throw new Error("Missing required environment variables.");
}

const sequelize = new Sequelize({
  database: DB_NAME,
  username: DB_USER,
  password: DB_PASS,
  host: DB_HOST,
  port: parseInt(DB_PORT, 10),
  dialect: "postgres",
  timezone: TIMEZONE,
  pool: {
    max: 200,
    min: 0,
    idle: 10000,
    acquire: 30000,
  },
  logging: NODE_ENV === "Development",
  models: [Driver, DriverAttendance, Shipment, ShipmentCost, VariableConfig],
});

export default sequelize;

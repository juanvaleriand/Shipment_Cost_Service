import { Sequelize } from "sequelize-typescript";
import { Driver } from "../models/driver";
import { DriverAttendance } from "../models/driverAttendance";
import { Shipment } from "../models/shipment";
import { ShipmentCost } from "../models/shipmentCost";
import { VariableConfig } from "../models/variableConfig";
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

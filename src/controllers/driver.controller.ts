import { Request, Response } from "express";
import DriverService from "../services/driver.service";

export interface QueryParams {
  month: number;
  year: number;
  page_size: number;
  current: number;
  driver_code: string;
  status: "PENDING" | "CONFIRMED" | "PAID";
  name: string;
}

class DriverController {
  async getDriverSalaries(req: Request, res: Response) {
    try {
      const {
        month,
        year,
        current = 1,
        page_size = 10,
        driver_code: driverCode,
        status,
        name,
      } = req.query as unknown as QueryParams;

      if (!month || !year) {
        return res.status(400).json({ error: "Month and year are required" });
      }

      const queries: QueryParams = {
        month: parseInt(month.toString(), 10),
        year: parseInt(year.toString(), 10),
        current: parseInt(current.toString(), 10),
        page_size: parseInt(page_size.toString(), 10),
        driver_code: driverCode,
        status,
        name,
      };

      const data = await DriverService.getDriverSalaries(queries);
      return res.json(data);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "An error occurred while fetching driver salaries",
      });
    }
  }
}

export default new DriverController();

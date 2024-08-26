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
      const month = parseInt(req.query.month as string, 10);
      const year = parseInt(req.query.year as string, 10);
      const current = parseInt(req.query.current as string, 10) || 1;
      const pageSize = parseInt(req.query.page_size as string, 10) || 10;
      const driverCode = req.query.driver_code as string;
      const status = req.query.status as "PENDING" | "CONFIRMED" | "PAID";
      const name = req.query.name as string;
      const queries: QueryParams = {
        month,
        year,
        current,
        page_size: pageSize,
        driver_code: driverCode,
        status,
        name,
      };

      if (!queries.month || !queries.year) {
        return res.status(400).json({ error: "Month and year are required" });
      }

      const data = await DriverService.getDriverSalaries(queries);
      return res.json(data);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching driver salaries" });
    }
  }
}

export default new DriverController();

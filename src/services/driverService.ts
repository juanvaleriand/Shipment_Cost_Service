import sequelize from "../config/sequelize";
import { QueryParams } from "../controllers/driverController";
import { Driver } from "../models/driver";
import { DriverAttendance } from "../models/driverAttendance";
import { ShipmentCost } from "../models/shipmentCost";
import { VariableConfig } from "../models/variableConfig";
import { Filterable, Op, WhereOptions } from "sequelize";

class DriverService {
  async getDriverSalaries(queries: QueryParams) {
    const { month, year, current, page_size, driver_code, status, name } =
      queries;
    const offset = (current - 1) * page_size;

    const attendanceSalaryConfig = await VariableConfig.findOne({
      where: { key: "DRIVER_MONTHLY_ATTENDANCE_SALARY" },
    });

    const attendanceSalary = attendanceSalaryConfig
      ? Number(attendanceSalaryConfig.value)
      : 50000;

    const whereDriverClause: Filterable<Driver>["where"] = {};

    if (name) {
      whereDriverClause.name = { [Op.iLike]: `%${name}%` };
    }

    if (driver_code) {
      whereDriverClause.driver_code = { [Op.iLike]: `%${driver_code}%` };
    }

    const whereShippingCostClause: Filterable<ShipmentCost>["where"] = {};

    if (status) {
      whereShippingCostClause.cost_status = {
        [Op.iLike]: `%${status}%`,
      };
    }

    const whereDriverAttendanceClause: WhereOptions = {
      attendance_date: {
        [Op.and]: [
          sequelize.where(
            sequelize.fn(
              "DATE_PART",
              "MONTH",
              sequelize.col("attendance_date")
            ),
            month
          ),
          sequelize.where(
            sequelize.fn("DATE_PART", "YEAR", sequelize.col("attendance_date")),
            year
          ),
        ],
      },
    };

    const driversPromise = Driver.findAll({
      include: [
        {
          model: DriverAttendance,
          where: whereDriverAttendanceClause,
          required: true,
        },
        {
          model: ShipmentCost,
          where: whereShippingCostClause,
          required: true,
        },
      ],
      where: whereDriverClause,
      offset,
      limit: page_size,
    });

    const totalRowPromise = Driver.count({
      include: [
        {
          model: ShipmentCost,
          where: whereShippingCostClause,
          required: true,
        },
        {
          model: DriverAttendance,
          where: whereDriverAttendanceClause,
          required: true,
        },
      ],
      distinct: true,
      col: "driver_code",
    });

    const [drivers, totalRow] = await Promise.all([
      driversPromise,
      totalRowPromise,
    ]);

    const result = drivers
      .map((driver) => {
        const totalPending = driver.shipmentCosts
          .filter((s) => s.cost_status === "PENDING")
          .reduce((sum, s) => sum + parseFloat(String(s.total_costs)), 0);
        const totalConfirmed = driver.shipmentCosts
          .filter((s) => s.cost_status === "CONFIRMED")
          .reduce((sum, s) => sum + parseFloat(String(s.total_costs)), 0);
        const totalPaid = driver.shipmentCosts
          .filter((s) => s.cost_status === "PAID")
          .reduce((sum, s) => sum + parseFloat(String(s.total_costs)), 0);
        const totalAttendanceSalary =
          driver.driverAttendances.filter((a) => a.attendance_status).length *
          attendanceSalary;
        const totalSalary =
          totalPending + totalConfirmed + totalPaid + totalAttendanceSalary;
        const countShipment = new Set(
          driver.shipmentCosts.map((s) => s.shipment_no)
        ).size;

        return {
          driver_code: driver.driver_code,
          name: driver.name,
          total_pending: totalPending,
          total_confirmed: totalConfirmed,
          total_paid: totalPaid,
          total_attendance_salary: totalAttendanceSalary,
          total_salary: totalSalary,
          count_shipment: countShipment,
        };
      })
      .filter((driver) => driver.total_salary > 0);

    return {
      data: result,
      total_row: totalRow,
      current,
      page_size: page_size,
    };
  }
}

export default new DriverService();

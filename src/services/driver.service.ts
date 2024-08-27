import sequelize from "../config/sequelize";
import { QueryParams } from "../controllers/driver.controller";
import { Driver } from "../models/driver.model";
import { DriverAttendance } from "../models/driverAttendance.model";
import { ShipmentCost } from "../models/shipmentCost.model";
import { VariableConfig } from "../models/variableConfig.model";
import { Filterable, Op, WhereOptions } from "sequelize";

class DriverService {
  async getDriverSalaries(queries: QueryParams) {
    const { month, year, current, page_size, driver_code, status, name } =
      queries;
    const offset = (current - 1) * page_size;

    const attendanceSalary = await this.getAttendanceSalary();

    const whereDriverClause: Filterable<Driver>["where"] = {};
    if (name) whereDriverClause.name = { [Op.iLike]: `%${name}%` };
    if (driver_code)
      whereDriverClause.driver_code = { [Op.iLike]: `%${driver_code}%` };

    const whereShippingCostClause: Filterable<ShipmentCost>["where"] = {};
    if (status)
      whereShippingCostClause.cost_status = { [Op.iLike]: `%${status}%` };

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

    const [drivers, totalRow] = await Promise.all([
      this.fetchDrivers(
        whereDriverClause,
        whereShippingCostClause,
        whereDriverAttendanceClause,
        offset,
        page_size
      ),
      this.countDrivers(
        whereDriverClause,
        whereShippingCostClause,
        whereDriverAttendanceClause
      ),
    ]);

    const result = this.calculateDriverSalaries(drivers, attendanceSalary);

    return {
      data: result,
      total_row: totalRow,
      current,
      page_size,
    };
  }

  private async getAttendanceSalary() {
    const config = await VariableConfig.findOne({
      where: { key: "DRIVER_MONTHLY_ATTENDANCE_SALARY" },
    });
    return config ? Number(config.value) : 50000;
  }

  private fetchDrivers(
    whereDriverClause: WhereOptions<Driver>,
    whereShippingCostClause: WhereOptions<ShipmentCost>,
    whereDriverAttendanceClause: WhereOptions<DriverAttendance>,
    offset: number,
    limit: number
  ) {
    return Driver.findAll({
      include: [
        {
          model: DriverAttendance,
          where: whereDriverAttendanceClause,
          required: true,
        },
        { model: ShipmentCost, where: whereShippingCostClause, required: true },
      ],
      where: whereDriverClause,
      offset,
      limit,
    });
  }

  private countDrivers(
    whereDriverClause: WhereOptions<Driver>,
    whereShippingCostClause: WhereOptions<ShipmentCost>,
    whereDriverAttendanceClause: WhereOptions<DriverAttendance>
  ) {
    return Driver.count({
      include: [
        { model: ShipmentCost, where: whereShippingCostClause, required: true },
        {
          model: DriverAttendance,
          where: whereDriverAttendanceClause,
          required: true,
        },
      ],
      where: whereDriverClause,
      distinct: true,
      col: "driver_code",
    });
  }

  private calculateDriverSalaries(drivers: Driver[], attendanceSalary: number) {
    return drivers
      .map((driver) => {
        const totalPending = this.calculateTotalCost(
          driver.shipmentCosts,
          "PENDING"
        );
        const totalConfirmed = this.calculateTotalCost(
          driver.shipmentCosts,
          "CONFIRMED"
        );
        const totalPaid = this.calculateTotalCost(driver.shipmentCosts, "PAID");

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
  }

  private calculateTotalCost(shipmentCosts: ShipmentCost[], status: string) {
    return shipmentCosts
      .filter((s) => s.cost_status === status)
      .reduce((sum, s) => sum + parseFloat(String(s.total_costs)), 0);
  }
}

export default new DriverService();

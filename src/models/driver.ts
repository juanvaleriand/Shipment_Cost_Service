import {
  Table,
  Column,
  Model,
  PrimaryKey,
  HasMany,
  DataType,
} from "sequelize-typescript";
import { DriverAttendance } from "./driverAttendance";
import { ShipmentCost } from "./shipmentCost";

@Table({
  tableName: "drivers",
  timestamps: false,
})
export class Driver extends Model<Driver> {
  @PrimaryKey
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  driver_code!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  name!: string;

  @HasMany(() => DriverAttendance, {
    foreignKey: "driver_code",
    sourceKey: "driver_code",
  })
  driverAttendances!: DriverAttendance[];

  @HasMany(() => ShipmentCost, {
    foreignKey: "driver_code",
    sourceKey: "driver_code",
  })
  shipmentCosts!: ShipmentCost[];
}

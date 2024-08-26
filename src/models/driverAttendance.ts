import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Driver } from "./driver";

@Table({
  tableName: "driver_attendances",
  timestamps: false,
})
export class DriverAttendance extends Model<DriverAttendance> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  id!: number;

  @ForeignKey(() => Driver)
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  driver_code!: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  attendance_date!: Date;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  attendance_status!: string;

  @BelongsTo(() => Driver, {
    foreignKey: "driver_code",
    targetKey: "driver_code",
  })
  driver!: Driver;
}

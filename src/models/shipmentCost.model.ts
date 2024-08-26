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
import { Driver } from "./driver.model";
import { Shipment } from "./shipment.model";

@Table({
  tableName: "shipment_costs",
  timestamps: false,
})
export class ShipmentCost extends Model<ShipmentCost> {
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
    allowNull: true,
  })
  driver_code!: string;

  @ForeignKey(() => Shipment)
  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  shipment_no!: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  total_costs!: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  cost_status!: string;

  @BelongsTo(() => Driver, {
    foreignKey: "driver_code",
    targetKey: "driver_code",
  })
  driver!: Driver;

  @BelongsTo(() => Shipment, {
    foreignKey: "shipment_no",
    targetKey: "shipment_no",
  })
  shipment!: Shipment;
}

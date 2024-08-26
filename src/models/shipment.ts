import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
} from "sequelize-typescript";

@Table({
  tableName: "shipments",
  timestamps: false,
})
export class Shipment extends Model<Shipment> {
  @PrimaryKey
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  shipment_no!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  shipment_date!: Date;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  shipment_status!: string;
}

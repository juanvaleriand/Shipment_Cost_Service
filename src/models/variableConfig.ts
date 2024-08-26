import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
} from "sequelize-typescript";

@Table({
  tableName: "variable_configs",
  timestamps: false,
})
export class VariableConfig extends Model<VariableConfig> {
  @PrimaryKey
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  key!: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  value!: number;
}

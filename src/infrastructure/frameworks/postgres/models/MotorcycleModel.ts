import { Model, DataTypes, Sequelize } from "sequelize";
import ConcessionModel from "./ConcessionModel";

class MotorcycleModel extends Model {
  public id!: string;
  public brand!: string;
  public model!: string;
  public vin!: string;
  public currentMileage!: number;
  public concessionId!: string;

  static initialize(sequelize: Sequelize) {
    return MotorcycleModel.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        brand: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        model: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        vin: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        currentMileage: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        concessionId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: ConcessionModel,
            key: "id",
          },
        },
      },
      {
        sequelize,
        modelName: "Motorcycle",
        tableName: "motorcycles",
        timestamps: true,
      }
    );
  }
}

export default MotorcycleModel;

import { Model, DataTypes, Sequelize } from "sequelize";
import ConcessionModel from "./ConcessionModel";
import { MotorcycleStatus } from '../../../../domain/motorcycle/enums/MotorcycleStatus';

class MotorcycleModel extends Model {
  public id!: string;
  public brand!: string;
  public model!: string;
  public year!: number;
  public vin!: string;
  public mileage!: number;
  public status!: MotorcycleStatus;
  public concessionId!: string;

  public static isInitialized: boolean = false;

  static initialize(sequelize: Sequelize): void {
    if (this.isInitialized) return;

    MotorcycleModel.init({
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      brand: {
        type: DataTypes.STRING,
        allowNull: false
      },
      model: {
        type: DataTypes.STRING,
        allowNull: false
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: () => new Date().getFullYear()
      },
      vin: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      mileage: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM(...Object.values(MotorcycleStatus)),
        allowNull: false,
        defaultValue: MotorcycleStatus.AVAILABLE
      },
      concessionId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: ConcessionModel,
          key: 'id'
        }
      }
    }, {
      sequelize,
      modelName: 'Motorcycle',
      tableName: 'motorcycles',
      timestamps: true
    });

    this.isInitialized = true;
  }
}

export default MotorcycleModel;

import { Model, DataTypes, Sequelize } from 'sequelize';
import { LicenseType, DriverStatus } from '../../../../domain/driver/entities/Driver';
import MotorcycleModel from './MotorcycleModel';

export default class DriverModel extends Model {
  public id!: string;
  public firstName!: string;
  public lastName!: string;
  public licenseNumber!: string;
  public licenseType!: LicenseType;
  public licenseExpirationDate!: Date;
  public status!: DriverStatus;
  public companyId?: string;
  public currentMotorcycleId?: string;
  public drivingExperience!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initialize(sequelize: Sequelize): void {
    DriverModel.init({
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      licenseNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      licenseType: {
        type: DataTypes.ENUM(...Object.values(LicenseType)),
        allowNull: false
      },
      licenseExpirationDate: {
        type: DataTypes.DATE,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM(...Object.values(DriverStatus)),
        allowNull: false,
        defaultValue: DriverStatus.ACTIVE
      },
      companyId: {
        type: DataTypes.UUID,
        allowNull: true
      },
      currentMotorcycleId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: MotorcycleModel,
          key: 'id'
        }
      },
      drivingExperience: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    }, {
      sequelize,
      modelName: 'Driver',
      tableName: 'drivers',
      timestamps: true
    });

    // Associations
    DriverModel.belongsTo(MotorcycleModel, { 
      foreignKey: 'currentMotorcycleId', 
      as: 'currentMotorcycle' 
    });
  }
}

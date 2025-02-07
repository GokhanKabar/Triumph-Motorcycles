import { Model, DataTypes, Sequelize } from 'sequelize';
import { MaintenanceType, MaintenanceStatus } from '../../../../domain/maintenance/entities/Maintenance';
import MotorcycleModel from './MotorcycleModel';

export default class MaintenanceModel extends Model {
  public id!: string;
  public motorcycleId!: string;
  public type!: MaintenanceType;
  public status!: MaintenanceStatus;
  public scheduledDate!: Date;
  public actualDate?: Date;
  public mileageAtMaintenance?: number;
  public technicianNotes?: string;
  public replacedParts?: string[];
  public totalCost?: number;
  public nextMaintenanceRecommendation?: Date;

  public static isInitialized: boolean = false;

  public static initialize(sequelize: Sequelize): void {
    MaintenanceModel.init({
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      motorcycleId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: MotorcycleModel,
          key: 'id'
        }
      },
      type: {
        type: DataTypes.ENUM(...Object.values(MaintenanceType)),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM(...Object.values(MaintenanceStatus)),
        allowNull: false,
        defaultValue: MaintenanceStatus.SCHEDULED
      },
      scheduledDate: {
        type: DataTypes.DATE,
        allowNull: false
      },
      actualDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      mileageAtMaintenance: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      technicianNotes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      replacedParts: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true
      },
      totalCost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      nextMaintenanceRecommendation: {
        type: DataTypes.DATE,
        allowNull: true
      }
    }, {
      sequelize,
      modelName: 'Maintenance',
      tableName: 'maintenances',
      timestamps: true
    });

    MaintenanceModel.isInitialized = true;

    // Associations
    MaintenanceModel.belongsTo(MotorcycleModel, {
      foreignKey: 'motorcycleId',
      as: 'motorcycle'
    });
  }
}

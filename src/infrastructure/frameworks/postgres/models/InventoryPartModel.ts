import { Model, DataTypes, Sequelize } from 'sequelize';
import { PartCategory } from '@domain/inventory/entities/InventoryPart';

class InventoryPartModel extends Model {
  public id!: string;
  public name!: string;
  public category!: PartCategory;
  public referenceNumber!: string;
  public currentStock!: number;
  public minStockThreshold!: number;
  public unitPrice!: number;
  public motorcycleModels!: string[];

  public static isInitialized: boolean = false;

  public static initialize(sequelize: Sequelize): void {
    if (this.isInitialized) return;

    InventoryPartModel.init({
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      category: {
        type: DataTypes.ENUM(...Object.values(PartCategory)),
        allowNull: false
      },
      referenceNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      currentStock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      minStockThreshold: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      unitPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      motorcycleModels: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true
      }
    }, {
      sequelize,
      modelName: 'InventoryPart',
      tableName: 'inventory_parts',
      timestamps: true
    });

    this.isInitialized = true;
  }
}

export default InventoryPartModel;

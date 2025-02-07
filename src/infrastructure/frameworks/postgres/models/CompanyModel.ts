import { DataTypes, Model, Sequelize } from "sequelize";
import { sequelize } from "../config/database";
import UserModel from "./UserModel";
import CompanyMotorcycleModel from "./CompanyMotorcycleModel";

class CompanyModel extends Model {
  public id!: string;
  public userId!: string;
  public name!: string;
  public address!: string;
  public createdAt!: Date;
  public updatedAt!: Date;

  private static sequelizeInstance: Sequelize | null = null;

  static initialize(sequelize: Sequelize): void {
    if (this.sequelizeInstance) {
      console.log("CompanyModel already initialized");
      return;
    }

    this.sequelizeInstance = sequelize;
    CompanyModel.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: UserModel,
            key: "id",
          },
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        address: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "companies",
        timestamps: true,
      }
    );

    console.log("CompanyModel initialized successfully");
  }

  public static associate(): void {
    if (!this.sequelizeInstance) {
      throw new Error('Cannot associate CompanyModel: sequelize instance is required');
    }

    CompanyModel.hasMany(CompanyMotorcycleModel, {
      foreignKey: 'companyId',
      as: 'companyMotorcycles'
    });
  }
}

export default CompanyModel;

import { DataTypes, Model, Sequelize } from "sequelize";
import CompanyModel from "./CompanyModel";
import MotorcycleModel from "./MotorcycleModel";

const TABLE_NAME = "company_motorcycles";

interface CompanyMotorcycleAttributes {
  id: string;
  companyId: string;
  motorcycleId: string;
  createdAt: Date;
  updatedAt: Date;
}

class CompanyMotorcycleModel
  extends Model<CompanyMotorcycleAttributes>
  implements CompanyMotorcycleAttributes
{
  public id!: string;
  public companyId!: string;
  public motorcycleId!: string;
  public createdAt!: Date;
  public updatedAt!: Date;

  private static sequelizeInstance: Sequelize | null = null;
  private static isInitialized: boolean = false;

  public static getInitializationStatus(): boolean {
    return this.isInitialized;
  }

  public static initialize(sequelize: Sequelize): void {
    console.log("Starting CompanyMotorcycleModel initialization...");
    if (this.isInitialized) {
      console.log("CompanyMotorcycleModel already initialized");
      return;
    }

    if (!sequelize) {
      console.error("Sequelize instance is null or undefined");
      throw new Error(
        "Cannot initialize CompanyMotorcycleModel: sequelize instance is required"
      );
    }

    console.log("Initializing CompanyMotorcycleModel...");
    this.sequelizeInstance = sequelize;
    CompanyMotorcycleModel.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        companyId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "companies",
            key: "id",
          },
        },
        motorcycleId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "motorcycles",
            key: "id",
          },
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: TABLE_NAME,
        timestamps: true,
        indexes: [
          {
            unique: true,
            fields: ["companyId", "motorcycleId"],
            name: "unique_company_motorcycle",
          },
        ],
      }
    );

    // Définir les associations
    CompanyMotorcycleModel.belongsTo(CompanyModel, {
      foreignKey: "companyId",
      as: "company",
    });

    CompanyMotorcycleModel.belongsTo(MotorcycleModel, {
      foreignKey: "motorcycleId",
      as: "motorcycle",
    });

    console.log("CompanyMotorcycleModel initialized successfully");
    this.isInitialized = true;
  }

  public static associate(): void {
    if (!this.sequelizeInstance) {
      throw new Error(
        "Cannot associate CompanyMotorcycleModel: sequelize instance is required"
      );
    }

    // Les associations seront définies lors de l'initialisation
  }
}

export default CompanyMotorcycleModel;

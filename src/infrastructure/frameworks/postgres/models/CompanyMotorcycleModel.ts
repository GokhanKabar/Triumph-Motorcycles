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
    if (this.isInitialized) {
      return;
    }

    if (!sequelize) {
      throw new Error(
        "Cannot initialize CompanyMotorcycleModel: sequelize instance is required"
      );
    }

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
        hooks: {
          afterCreate: async (association: CompanyMotorcycleModel) => {
            // Mettre à jour le statut de la moto à RESERVED quand elle est assignée
            await MotorcycleModel.update(
              { status: "RESERVED" },
              { where: { id: association.motorcycleId } }
            );
          },
          afterDestroy: async (association: CompanyMotorcycleModel) => {
            // Remettre le statut de la moto à AVAILABLE quand elle est désassignée
            await MotorcycleModel.update(
              { status: "AVAILABLE" },
              { where: { id: association.motorcycleId } }
            );
          },
        },
      }
    );

    // Définir les associations
    CompanyMotorcycleModel.belongsTo(CompanyModel, {
      foreignKey: "companyId",
      as: "company",
    });

    CompanyModel.hasMany(CompanyMotorcycleModel, {
      foreignKey: "companyId",
      as: "companyMotorcycles",
    });

    CompanyMotorcycleModel.belongsTo(MotorcycleModel, {
      foreignKey: "motorcycleId",
      as: "motorcycle",
    });

    MotorcycleModel.hasMany(CompanyMotorcycleModel, {
      foreignKey: "motorcycleId",
      as: "companyMotorcycles",
    });

    this.isInitialized = true;
  }

  public static associate(): void {}
}

export default CompanyMotorcycleModel;

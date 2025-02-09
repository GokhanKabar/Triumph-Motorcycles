import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import UserModel from "./UserModel";

class ConcessionModel extends Model {
  public id!: string;
  public userId!: string;
  public name!: string;
  public address!: string;
  public createdAt!: Date;
  public updatedAt!: Date;

  // Méthode d'initialisation statique
  static async initialize(sequelize: any) {
    if (!this.sequelize) {
      ConcessionModel.init(
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
            allowNull: true,
            defaultValue: "N/A"
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
          tableName: "concessions",
          timestamps: true,
        }
      );

      // Définir les associations
      ConcessionModel.belongsTo(UserModel, {
        foreignKey: "userId",
        as: "user",
      });
    }
  }
}

export default ConcessionModel;

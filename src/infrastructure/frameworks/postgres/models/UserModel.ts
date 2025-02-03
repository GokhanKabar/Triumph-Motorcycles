import { Model, DataTypes, Sequelize } from 'sequelize';
import { UserRole } from '../../../../domain/enums/UserRole';

class UserModel extends Model {
  public id!: string;
  public firstName!: string;
  public lastName!: string;
  public email!: string;
  public password!: string;
  public role!: UserRole;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Méthode statique pour initialiser le modèle
  static initialize(sequelize: Sequelize) {
    UserModel.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        firstName: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: '',
        },
        lastName: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: '',
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true,
          },
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        role: {
          type: DataTypes.ENUM(...Object.values(UserRole)),
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: true,
      }
    );
  }
}

export default UserModel;

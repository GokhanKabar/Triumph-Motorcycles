import { Model, DataTypes, Sequelize } from 'sequelize';
import { TestRideStatus, RiderExperience, LicenseType } from '../../../../domain/testRide/entities/TestRide';
import ConcessionModel from './ConcessionModel';

class TestRideModel extends Model {
  public id!: string;
  public concessionId!: string;
  public motorcycleId!: string;
  public motorcycleName!: string;
  public firstName!: string;
  public lastName!: string;
  public email!: string;
  public phoneNumber!: string;
  public desiredDate!: Date;
  public status!: TestRideStatus;
  public riderExperience!: RiderExperience;
  public licenseType!: LicenseType;
  public licenseNumber!: string;
  public hasTrainingCertificate!: boolean;
  public preferredRideTime?: string;
  public additionalRequirements?: string;
  public message?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public concession?: ConcessionModel;

  // Méthode statique pour initialiser le modèle
  static initialize(sequelize: Sequelize) {
    TestRideModel.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        concessionId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: ConcessionModel,
            key: 'id'
          }
        },
        motorcycleId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        motorcycleName: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        firstName: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: '',
        },
        lastName: {
          type: DataTypes.STRING,
          allowNull: false,
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
        phoneNumber: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        desiredDate: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM(...Object.values(TestRideStatus)),
          allowNull: false,
          defaultValue: TestRideStatus.PENDING,
        },
        riderExperience: {
          type: DataTypes.ENUM(...Object.values(RiderExperience)),
          allowNull: false,
        },
        licenseType: {
          type: DataTypes.ENUM(...Object.values(LicenseType)),
          allowNull: false,
        },
        licenseNumber: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        hasTrainingCertificate: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
          defaultValue: false,
        },
        preferredRideTime: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        additionalRequirements: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        message: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'test_rides',
        timestamps: true,
      }
    );

    // Associations
    TestRideModel.belongsTo(ConcessionModel, {
      foreignKey: 'concessionId',
      as: 'concession'
    });
  }
}

export default TestRideModel;

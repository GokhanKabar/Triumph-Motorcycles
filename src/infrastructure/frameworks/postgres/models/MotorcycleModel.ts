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
        defaultValue: MotorcycleStatus.AVAILABLE,
        validate: {
          isValidStatus(value: string) {
            console.log('DEBUG: Validation du statut de moto:', {
              value,
              allowedStatuses: Object.values(MotorcycleStatus),
              isValid: Object.values(MotorcycleStatus).includes(value as MotorcycleStatus)
            });
            
            if (!Object.values(MotorcycleStatus).includes(value as MotorcycleStatus)) {
              console.warn('DEBUG: Statut de moto invalide, utilisation du statut par défaut');
              this.setDataValue('status', MotorcycleStatus.AVAILABLE);
            }
          }
        },
        get() {
          const rawValue = this.getDataValue('status');
          console.log('DEBUG: Récupération du statut:', {
            rawValue,
            isDefault: rawValue === undefined || rawValue === null,
            stackTrace: new Error().stack
          });
          
          // Forcer le statut par défaut si undefined ou null
          const finalStatus = rawValue || MotorcycleStatus.AVAILABLE;
          
          console.log('DEBUG: Statut final:', {
            finalStatus,
            isDefault: finalStatus === MotorcycleStatus.AVAILABLE
          });
          
          return finalStatus;
        },
        set(value: MotorcycleStatus) {
          console.log('DEBUG: Définition du statut:', {
            value,
            defaultIfNull: value || MotorcycleStatus.AVAILABLE,
            stackTrace: new Error().stack
          });
          
          // Toujours définir un statut valide
          const safeStatus = value || MotorcycleStatus.AVAILABLE;
          this.setDataValue('status', safeStatus);
        },
        toJSON() {
          const status = this.getDataValue('status');
          console.log('DEBUG: Sérialisation du statut:', {
            status,
            serializedStatus: status || MotorcycleStatus.AVAILABLE,
            stackTrace: new Error().stack
          });
          
          // Toujours sérialiser un statut valide
          return status || MotorcycleStatus.AVAILABLE;
        }
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

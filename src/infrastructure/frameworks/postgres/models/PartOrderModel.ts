import { Model, DataTypes, Sequelize } from "sequelize";
import { OrderStatus } from "../../../../domain/partOrder/entities/PartOrder";

class PartOrderModel extends Model {
    public id!: string;
    public inventoryPartId!: string;
    public inventoryPartName!: string;
    public supplier!: string;
    public quantity!: number;
    public orderDate!: Date;
    public expectedDeliveryDate!: Date;
    public status!: OrderStatus;
    public totalCost!: number;
    public orderReference!: string;

    public static isInitialized: boolean = false;

    static initialize(sequelize: Sequelize): void {
        if (this.isInitialized) return;

        PartOrderModel.init({
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            inventoryPartId: {
                type: DataTypes.STRING,
                allowNull: false
            },
            inventoryPartName: {
                type: DataTypes.STRING,
                allowNull: false
            },
            supplier: {
                type: DataTypes.STRING,
                allowNull: false
            },
            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            orderDate: {
                type: DataTypes.DATE,
                allowNull: false
            },
            expectedDeliveryDate: {
                type: DataTypes.DATE,
                allowNull: false
            },
            status: {
                type: DataTypes.ENUM(...Object.values(OrderStatus)),
                allowNull: false,
                defaultValue: OrderStatus.PENDING,
                validate: {
                    isValidStatus(value: string) {
                        if (!Object.values(OrderStatus).includes(value as OrderStatus)) {
                            this.setDataValue('status', OrderStatus.PENDING);
                        }
                    }
                },
                get() {
                    const rawValue = this.getDataValue('status');

                    const finalStatus = rawValue || OrderStatus.PENDING;

                    return finalStatus;
                },
                set(value: OrderStatus) {
                    const safeStatus = value || OrderStatus.PENDING;
                    this.setDataValue('status', safeStatus);
                },
                toJSON() {
                    const status = this.getDataValue('status');
                    return status || OrderStatus.PENDING;
                }
            },
            totalCost: {
                type: DataTypes.FLOAT,
                allowNull: false
            },
            orderReference: {
                type: DataTypes.STRING,
                allowNull: false
            }
        }, {
            sequelize,
            modelName: 'PartOrder',
            tableName: 'part_orders',
            timestamps: true
        });

        this.isInitialized = true;
    }
}

export default PartOrderModel;

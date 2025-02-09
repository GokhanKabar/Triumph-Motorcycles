import { IPartOrderRepository } from "../../../domain/partOrder/repositories/IPartOrderRepository";
import PartOrderNotFoundError from "../../../domain/partOrder/errors/PartOrderNotFoundError";

export class DeletePartOrderUseCase {
    constructor(
        private readonly partOrderRepository: IPartOrderRepository
    ) { }

    async execute(id: string): Promise<void | Error> {
        const partOrder = await this.partOrderRepository.findById(id);

        if (!partOrder) {
            return new PartOrderNotFoundError(id);
        }

        await this.partOrderRepository.delete(id);
    }
}
export default class PartOrderNotFoundError extends Error {
    constructor(id: string) {
        super(`Part order with ID ${id} not found`);
        this.name = 'PartOrderNotFoundError';
    }
}
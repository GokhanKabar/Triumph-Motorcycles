export default class TestRideNotFoundError extends Error {
  constructor(id: string) {
    super(`Test ride with ID ${id} not found`);
    this.name = 'TestRideNotFoundError';
  }
}

import TestRide from '../entities/TestRide';

export interface ITestRideRepository {
  findAll(): Promise<TestRide[]>;
  create(testRide: TestRide): Promise<TestRide>;
  findById(id: string): Promise<TestRide | null>;
  findByConcessionId(concessionId: string): Promise<TestRide[]>;
  findByMotorcycleId(motorcycleId: string): Promise<TestRide[]>;
  update(testRide: TestRide): Promise<TestRide>;
  delete(id: string): Promise<void>;
}

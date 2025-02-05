import Motorcycle from "../entities/Motorcycle";

export interface IMotorcycleRepository {
  findAll(): Promise<Motorcycle[]>;
  findById(id: string): Promise<Motorcycle | null>;
  findByConcessionId(concessionId: string): Promise<Motorcycle[]>;
  save(motorcycle: Motorcycle): Promise<void>;
  update(motorcycle: Motorcycle): Promise<void>;
  delete(id: string): Promise<void>;
  count(): Promise<number>;
}

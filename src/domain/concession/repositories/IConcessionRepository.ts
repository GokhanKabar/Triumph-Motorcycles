import Concession from "../entities/Concession";

export interface IConcessionRepository {
  findAll(): Promise<Concession[]>;
  findById(id: string): Promise<Concession | null>;
  findByUserId(userId: string): Promise<Concession[]>;
  save(concession: Concession): Promise<void>;
  update(concession: Concession): Promise<void>;
  delete(id: string): Promise<void>;
}

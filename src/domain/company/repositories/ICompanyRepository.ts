import Company from "../entities/Company";

export interface ICompanyRepository {
  findAll(): Promise<Company[]>;
  save(company: Company): Promise<void>;
  findById(id: string): Promise<Company | null>;
  findByUserId(userId: string): Promise<Company[]>;
  update(company: Company): Promise<void>;
  delete(id: string): Promise<void>;
}

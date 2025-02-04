import { CompanyResponseDTO } from "../../../../../../application/dtos/CompanyDTO";

export interface ICompanyListProps {
  onEdit: (company: CompanyResponseDTO) => void;
  onDelete: (companyId: string) => void;
  refreshKey?: number;
}

export interface ICompanyListState {
  companies: CompanyResponseDTO[];
  isLoading: boolean;
  error: Error | null;
}

export interface ICompanyListHandlers {
  handleDeleteCompany: (companyId: string) => Promise<void>;
}

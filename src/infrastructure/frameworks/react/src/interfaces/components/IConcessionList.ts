import { ConcessionResponseDTO } from "../../../../../../application/dtos/ConcessionDTO";

export interface IConcessionListProps {
  onEdit: (concession: ConcessionResponseDTO) => void;
  onDelete: (concessionId: string) => void;
  refreshKey: number;
}

export interface IConcessionListState {
  concessions: ConcessionResponseDTO[];
  isLoading: boolean;
  error: Error | null;
}

export interface IConcessionListHandlers {
  handleDeleteConcession: (concessionId: string) => Promise<void>;
}

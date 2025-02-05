import { MotorcycleResponseDTO } from "../../../../../../application/dtos/MotorcycleDTO";

export interface IMotorcycleListProps {
  onEdit: (motorcycle: MotorcycleResponseDTO) => void;
  onDelete: (motorcycleId: string) => void;
  refreshKey: number;
}

export interface IMotorcycleListState {
  motorcycles: MotorcycleResponseDTO[];
  concessions: Record<string, string>;
  isLoading: boolean;
  error: Error | null;
}

export interface IMotorcycleListHandlers {
  handleDeleteMotorcycle: (motorcycleId: string) => Promise<void>;
}

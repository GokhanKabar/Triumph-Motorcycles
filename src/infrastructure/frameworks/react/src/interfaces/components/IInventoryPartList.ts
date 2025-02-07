import { InventoryPartResponseDTO } from '@application/maintenance/dtos/InventoryPartResponseDTO';

export interface IInventoryPartListProps {
  onStockManage?: (partId: string, quantity: number, action: 'add' | 'remove') => void;
  onEdit?: (part: InventoryPartResponseDTO) => void;
}

export interface IInventoryPartListState {
  parts: InventoryPartResponseDTO[];
  isLoading: boolean;
  error: Error | null;
}

export interface IPaginationConfig {
  page: number;
  rowsPerPage: number;
  totalItems: number;
}

export interface IInventoryPartListHandlers {
  handleStockManagement: (
    partId: string, 
    quantity: number, 
    action: 'add' | 'remove'
  ) => Promise<void>;
  getStockColor: (currentStock: number, minStockThreshold: number) => string;
}

export interface IPaginatedInventoryPartData {
  paginatedParts: InventoryPartResponseDTO[];
  paginationConfig: IPaginationConfig;
}

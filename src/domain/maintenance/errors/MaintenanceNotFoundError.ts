export class MaintenanceNotFoundError extends Error {
  constructor() {
    super('Maintenance record not found');
    this.name = 'MaintenanceNotFoundError';
  }
}

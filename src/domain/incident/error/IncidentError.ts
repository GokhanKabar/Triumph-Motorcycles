export class IncidentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IncidentError';

    Object.setPrototypeOf(this, IncidentError.prototype);
  }

  static invalidTestRideId(): IncidentError {
    return new IncidentError("L'ID du test ride est requis");
  }

  static missingDescription(): IncidentError {
    return new IncidentError("Une description est obligatoire");
  }

  static futureDateNotAllowed(): IncidentError {
    return new IncidentError("La date de l'incident ne peut pas être dans le futur");
  }
}

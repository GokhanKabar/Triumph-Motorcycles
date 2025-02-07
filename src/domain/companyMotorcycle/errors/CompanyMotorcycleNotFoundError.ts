export class CompanyMotorcycleNotFoundError extends Error {
    constructor(companyId?: string, motorcycleId?: string) {
        const message = companyId && motorcycleId
            ? `Aucune relation trouvée entre l'entreprise ${companyId} et la moto ${motorcycleId}`
            : companyId
                ? `Aucune moto trouvée pour l'entreprise ${companyId}`
                : motorcycleId
                    ? `Aucune entreprise trouvée pour la moto ${motorcycleId}`
                    : 'Relation entreprise-moto non trouvée';
        
        super(message);
        this.name = 'CompanyMotorcycleNotFoundError';
    }
}

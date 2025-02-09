import { Request, Response } from "express";
import { AssignMotorcycleToCompanyUseCase } from "../../../application/companyMotorcycle/use-cases/AssignMotorcycleToCompanyUseCase";
import { RemoveMotorcycleFromCompanyUseCase } from "../../../application/companyMotorcycle/use-cases/RemoveMotorcycleFromCompanyUseCase";
import { GetCompanyMotorcyclesUseCase } from "../../../application/companyMotorcycle/use-cases/GetCompanyMotorcyclesUseCase";
import { CompanyNotFoundError } from "../../../domain/company/errors/CompanyNotFoundError";
import { MotorcycleNotFoundError } from "../../../domain/motorcycle/errors/MotorcycleNotFoundError";
import { CompanyMotorcycleNotFoundError } from "../../../domain/companyMotorcycle/errors/CompanyMotorcycleNotFoundError";

export class CompanyMotorcycleController {
  private assignMotorcycleToCompanyUseCase: AssignMotorcycleToCompanyUseCase;
  private removeMotorcycleFromCompanyUseCase: RemoveMotorcycleFromCompanyUseCase;
  private getCompanyMotorcyclesUseCase: GetCompanyMotorcyclesUseCase;

  constructor(
    assignMotorcycleToCompanyUseCase: AssignMotorcycleToCompanyUseCase,
    removeMotorcycleFromCompanyUseCase: RemoveMotorcycleFromCompanyUseCase,
    getCompanyMotorcyclesUseCase: GetCompanyMotorcyclesUseCase
  ) {
    this.assignMotorcycleToCompanyUseCase = assignMotorcycleToCompanyUseCase;
    this.removeMotorcycleFromCompanyUseCase =
      removeMotorcycleFromCompanyUseCase;
    this.getCompanyMotorcyclesUseCase = getCompanyMotorcyclesUseCase;
  }

  async assignMotorcycle(req: Request, res: Response): Promise<void> {
    try {
      const companyId = req.params.companyId;
      const { motorcycleId } = req.body;

      if (!motorcycleId) {
        res.status(400).json({
          error: "motorcycleId est requis dans le corps de la requête",
        });
        return;
      }

      await this.assignMotorcycleToCompanyUseCase.execute({
        companyId,
        motorcycleId,
      });

      res
        .status(201)
        .json({ message: "Moto assignée avec succès à l'entreprise" });
    } catch (error) {

      if (
        error instanceof CompanyNotFoundError ||
        error instanceof MotorcycleNotFoundError
      ) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({
          error: "Erreur interne du serveur",
          details: error.message,
        });
      }
    }
  }

  async removeMotorcycle(req: Request, res: Response): Promise<void> {
    try {
      const { companyId, motorcycleId } = req.params;

      await this.removeMotorcycleFromCompanyUseCase.execute(
        companyId,
        motorcycleId
      );

      res
        .status(200)
        .json({ message: "Moto retirée avec succès de l'entreprise" });
    } catch (error) {
      if (error instanceof CompanyMotorcycleNotFoundError) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Erreur interne du serveur" });
      }
    }
  }

  async getCompanyMotorcycles(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;

      const motorcycles = await this.getCompanyMotorcyclesUseCase.execute(
        companyId
      );

      // Même si aucune moto n'est trouvée, on renvoie un tableau vide avec un statut 200
      res.status(200).json(motorcycles || []);
    } catch (error) {
      if (error instanceof CompanyNotFoundError) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({
          error: "Erreur interne du serveur",
          details: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }
}

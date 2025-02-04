import { Request, Response, NextFunction } from "express";

export const validateCompanyMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, address } = req.body;

  // Validation du nom
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return res
      .status(400)
      .json({ message: "Le nom de l'entreprise est requis" });
  }

  // Validation de l'adresse
  if (!address || typeof address !== "string" || address.trim().length === 0) {
    return res
      .status(400)
      .json({ message: "L'adresse de l'entreprise est requise" });
  }

  next();
};

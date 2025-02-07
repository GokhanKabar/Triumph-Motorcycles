import React from "react";
import { MotorcycleStatus } from "@domain/motorcycle/enums/MotorcycleStatus";

interface StatusBadgeProps {
  status: MotorcycleStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = (
    status: MotorcycleStatus
  ): { text: string; className: string } => {
    switch (status) {
      case MotorcycleStatus.AVAILABLE:
        return {
          text: "Disponible",
          className: "bg-green-100 text-green-800",
        };
      case MotorcycleStatus.RESERVED:
        return {
          text: "Réservée",
          className: "bg-yellow-100 text-yellow-800",
        };
      case MotorcycleStatus.SOLD:
        return {
          text: "Vendue",
          className: "bg-gray-100 text-gray-800",
        };
      case MotorcycleStatus.MAINTENANCE:
        return {
          text: "En maintenance",
          className: "bg-red-100 text-red-800",
        };
      default:
        return {
          text: status,
          className: "bg-gray-100 text-gray-800",
        };
    }
  };

  const { text, className } = getStatusConfig(status);

  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${className}`}
    >
      {text}
    </span>
  );
};

export default StatusBadge;

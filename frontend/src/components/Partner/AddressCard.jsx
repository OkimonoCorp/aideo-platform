import React from "react";
import Button from "../Button.jsx";

/**
 * Composant pour afficher une carte d'adresse avec les actions
 */
function AddressCard({
  address,
  onEdit,
  onDelete,
  isLoading = false,
}) {
  return (
    <div
      className={`w-full bg-surface-container rounded-2xl shadow-md p-6 mb-4 border-l-4 ${address.isPrimary ? "border-primary" : "border-outline"} overflow-hidden`}
    >
      <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-on-surface truncate max-w-full">
              {address.libelle}
            </h3>
          </div>
        </div>
        <div className="flex gap-2 sm:ml-4 flex-shrink-0 items-center">
          <button
            onClick={() => onEdit(address)}
            disabled={isLoading}
            className="p-2 hover:bg-surface-container-high rounded-lg transition-colors disabled:opacity-50"
            title="Modifier"
            aria-label="Modifier l'adresse"
          >
            <img
              src="/icons/edit.svg"
              alt="Modifier"
              className="w-5 h-5 max-w-full address-action-icon"
            />
          </button>
          {/* bouton modifier */}
          <button
            onClick={() => onDelete(address.id)}
            disabled={isLoading}
            className="p-2 hover:bg-error-container rounded-lg transition-colors disabled:opacity-50"
            title="Supprimer"
            aria-label="Supprimer l'adresse"
          >
            <img
              src="/icons/delete.svg"
              alt="Supprimer"
              className="w-5 h-5 max-w-full address-action-icon"
            />
          </button>
          {/* bouton supprimer */}
        </div>
      </div>
    </div>
  );
}

export default AddressCard;

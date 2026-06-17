import React from 'react';
import IconButton from '../IconButton.jsx';
import DeleteIcon from '/icons/delete.svg?react';

/**
 * Composant pour afficher une carte d'avantage avec les actions (modifier, supprimer)
 */
function AdvantageCard({ advantage, onDelete }) {
    return (
        <div className="w-full bg-surface-container rounded-2xl shadow-md p-6 mb-4 border-l-4 border-primary overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                    {/* en-tête carte: titre + statut */}
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-on-surface mb-2 truncate max-w-full">
                            {advantage.title}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${advantage.status === 'approved' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-variant text-on-surface-variant'}`}>
                            {advantage.status ? 'Approuvé' : 'En attente'}
                        </span>
                    </div>

                    {/* description de l'avantage */}
                    <div
                        role="region"
                        aria-label={`Description de l'avantage ${advantage.title}`}
                        className="text-on-surface-variant mb-3 max-h-28 overflow-auto break-words whitespace-pre-wrap text-sm pr-2"
                    >
                        {advantage.description}
                    </div>

                    {/* points et date */}
                    <div className="flex flex-wrap items-center gap-3">
                        {advantage.status === 'approved' && advantage.pointsAssigned && (
                            <span className="inline-block bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                                {advantage.pointsAssigned} points
                            </span>
                        )}
                        <span className="text-xs text-on-surface-variant whitespace-nowrap truncate">
                            Créé le {new Date(advantage.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                    </div>
                </div>
                <div className="flex gap-2 sm:ml-4 flex-shrink-0 items-center">
                    {/* bouton supprimer */}
                    <IconButton
                        className={'w-8 h-8 bg-error hover:bg-error/80 rounded-lg'}
                        title={"Supprimer l'avantage"}
                        icon={<DeleteIcon className={'fill-on-error w-5 h-5'}/>}
                        onClick={() => onDelete(advantage.id)}
                    />
                </div>
            </div>
        </div>
    );
}

export default AdvantageCard;

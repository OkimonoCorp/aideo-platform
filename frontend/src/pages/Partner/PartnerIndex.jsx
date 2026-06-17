import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Page d'index du partenaire - redirige vers la page par défaut
 */
function PartnerIndex() {
    return <Navigate to="/partner/company" replace />;
}

export default PartnerIndex;

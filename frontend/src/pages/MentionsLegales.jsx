import React from 'react';
import {Link, useNavigate} from 'react-router-dom';
import logo from '/logo/logo_primaire_noire.svg';

const MentionsLegales = () => {
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-surface-variant">
      {/* Header */}
      <header className="bg-surface border-b border-outline px-6 lg:px-14 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => nav('/')}
            className="p-2 rounded-full hover:bg-surface-container-low transition-colors"
            aria-label="Retour"
          >
            <span className="text-xl">←</span>
          </button>
          <img
            src={logo}
            alt="AidéO"
            className="h-10 w-auto cursor-pointer"
            onClick={() => nav('/')}
          />
        </div>
      </header>

      {/* Contenu */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-surface rounded-2xl shadow-lg p-8 border border-outline">
          <h1 className="text-3xl font-bold text-primary mb-8">Mentions Légales</h1>

          <p className="text-on-surface-variant mb-6">En vigueur à compter du <strong>01/01/26</strong>.</p>

          {/* Identification */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-on-surface mb-4">Identification</h2>

            <h3 className="text-lg font-medium text-on-surface mb-2">Éditeur du site</h3>
            <p className="text-on-surface-variant mb-3">
              AidéO est un projet universitaire développé dans le cadre d'une SAE. L'éditeur du site est le groupe de projet identifié par le numéro d'équipe ou l'intitulé fourni par l'IUT. Les membres du groupe sont les étudiant·e·s auteurs du projet ; leurs noms peuvent figurer dans la documentation du projet ou être communiqués sur demande.
            </p>
            <ul className="list-disc pl-6 text-on-surface-variant">
              <li>Raison sociale / Structure porteuse : IUT / établissement universitaire (le cas échéant)</li>
              <li>Responsable de projet : nom du responsable (membre du groupe ou enseignant référent)</li>
              <li>Adresse : adresse de l'IUT ou du laboratoire hébergeant le projet</li>
              <li>Contact : <a href="mailto:contact@aideo.navilink.fr" className="text-primary hover:underline">contact@aideo.navilink.fr</a></li>
            </ul>
          </section>

          {/* Hébergeur */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-on-surface mb-4">Hébergeur du site</h2>
            <p className="text-on-surface-variant mb-3">Le site AidéO est hébergé par un prestataire externe. Selon la configuration actuelle, l'hébergement est assuré par :</p>
            <ul className="list-none space-y-2 text-on-surface-variant ml-4">
              <li><strong>Hébergeur :</strong> OVH SAS (ou autre prestataire identifié par l'équipe)</li>
              <li><strong>Adresse :</strong> 2 rue Kellermann, 59100 Roubaix, France</li>
              <li><strong>Téléphone :</strong> +33 (0)9 72 10 10 07</li>
              <li><strong>Site web :</strong> www.ovh.com</li>
            </ul>
          </section>

          {/* Responsable des traitements */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-on-surface mb-4">Responsable des traitements</h2>
            <p className="text-on-surface-variant mb-3">
              Le responsable des traitements est la personne ou l'entité en charge du projet au sein de l'IUT (enseignant référent ou responsable de projet). Pour toute question relative au traitement des données, écrivez à : <a href="mailto:aideo@navilink.fr" className="text-primary hover:underline">aideo@navilink.fr</a>.
            </p>
          </section>

          {/* Données collectées */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-on-surface mb-4">Données collectées</h2>
            <p className="text-on-surface-variant mb-3">Les données suivantes pourront être récoltées lorsque vous utilisez la plateforme :</p>
            <ul className="list-disc pl-6 text-on-surface-variant">
              <li>Votre nom et prénom</li>
              <li>Votre adresse email</li>
              <li>Votre numéro de téléphone</li>
              <li>Votre localisation (préférences ou positionnement géographique si activé)</li>
            </ul>
          </section>

          {/* Finalités */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-on-surface mb-4">Finalités des traitements</h2>
            <ul className="list-disc pl-6 text-on-surface-variant">
              <li>Nom et prénom : affichage aux autres utilisateurs lors d'interactions sur la plateforme (profil, messages, activités).</li>
              <li>Adresse email : identification du compte, connexion et notification des utilisateurs en cas de modification des présentes mentions ou d'informations importantes liées au service.</li>
              <li>Numéro de téléphone : utilisé facultativement pour mettre en place une authentification à deux facteurs ou pour des modes d'authentification alternatifs sans email.</li>
              <li>Localisation : utilisée pour filtrer et proposer des services, offres ou événements pertinents près de chez vous (si l'utilisateur autorise la collecte).</li>
            </ul>
          </section>

          {/* Base juridique */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-on-surface mb-4">Base juridique du traitement</h2>
            <p className="text-on-surface-variant mb-3">
              Les traitements de données personnels effectués sur la plateforme reposent sur les bases juridiques suivantes, selon le cas :
            </p>
            <ul className="list-disc pl-6 text-on-surface-variant">
              <li>Exécution du contrat / fourniture du service : traitement nécessaire à la création et gestion de votre compte et à l'utilisation de la plateforme.</li>
              <li>Consentement : lorsque des traitements spécifiques (par exemple, localisation active ou envoi de communications marketing) requièrent votre accord explicite, nous recueillons votre consentement préalable et documenté.</li>
              <li>Intérêt légitime : pour des finalités limitées et proportionnées (par exemple, sécurité du site, prévention des fraudes), après analyse d'équilibre entre nos intérêts et vos droits.</li>
            </ul>
            <p className="text-on-surface-variant mt-3">Si vous avez besoin d'informations précises sur la base juridique applicable à un traitement particulier, contactez-nous à <a href="mailto:aideo@navilink.fr" className="text-primary hover:underline">aideo@navilink.fr</a>.</p>
          </section>

          {/* Destinataires */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-on-surface mb-4">Destinataires des données</h2>
            <p className="text-on-surface-variant mb-3">Vos informations ne sont pas transmises à des intermédiaires extérieurs à la plateforme sauf lorsque :</p>
            <ul className="list-disc pl-6 text-on-surface-variant">
              <li>la transmission est nécessaire pour respecter une obligation légale;</li>
              <li>vous avez expressément consenti au partage de certaines informations;</li>
              <li>un prestataire technique (par ex. hébergeur) traite des données pour notre compte et sous contrat (ces prestataires sont tenus à la confidentialité).</li>
            </ul>
          </section>

          {/* Durée de conservation */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-on-surface mb-4">Durée de conservation des données</h2>
            <p className="text-on-surface-variant mb-3">Sauf disposition légale contraire, les règles de conservation appliquées sont les suivantes :</p>
            <ul className="list-disc pl-6 text-on-surface-variant">
              <li>Toutes les données collectées sont conservées tant que le compte utilisateur est actif et jusqu'à la clôture du compte associé.</li>
            </ul>
          </section>

          {/* Droits des utilisateurs */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-on-surface mb-4">Droits des utilisateurs</h2>
            <p className="text-on-surface-variant mb-3">Conformément au RGPD et à la loi Informatique et Libertés, vous disposez des droits suivants concernant vos données personnelles :</p>
            <ul className="list-disc pl-6 text-on-surface-variant">
              <li>Droit d'accès : connaître les données que nous détenons vous concernant.</li>
              <li>Droit de rectification : demander la correction de données inexactes ou incomplètes.</li>
              <li>Droit à l'effacement : demander la suppression, sous réserve des obligations légales de conservation.</li>
              <li>Droit à la limitation du traitement et droit d'opposition.</li>
              <li>Droit à la portabilité des données lorsque le traitement est fondé sur votre consentement ou l'exécution d'un contrat.</li>
            </ul>
            <p className="text-on-surface-variant mt-3">Pour exercer ces droits, contactez-nous à <a href="mailto:aideo@navilink.fr" className="text-primary hover:underline">aideo@navilink.fr</a>. Si vous estimez que vos droits ne sont pas respectés, vous pouvez adresser une réclamation auprès de la CNIL (www.cnil.fr).</p>
          </section>

          {/* Cookies et traceurs */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-on-surface mb-4">Cookies et traceurs</h2>
            <p className="text-on-surface-variant mb-3">Notre plateforme n'utilise aucun cookie à but commercial. Le seul cookie stocké contient le token d'authentification courant, lui-même soumis à des rafraîchissements courants.</p>
            <p className="text-on-surface-variant mt-3">Pour plus d'informations, consultez notre <Link to="/confidentialite" className="text-primary hover:underline">politique de confidentialité</Link>.</p>
          </section>

          {/* Sécurité */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-on-surface mb-4">Sécurité des données</h2>
            <p className="text-on-surface-variant mb-3">Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre la destruction accidentelle, la perte, l'altération ou l'accès non autorisé. Parmi ces mesures :</p>
            <ul className="list-disc pl-6 text-on-surface-variant">
              <li>Chiffrement des données sensibles en transit (TLS)</li>
              <li>Accès sécurisé à la plateforme via token d'authentification</li>
              <li>Contrôles d'accès et authentification pour les comptes administrateurs</li>
              <li>Mises à jour régulières des composants et correctifs de sécurité</li>
            </ul>
          </section>

          {/* Modifications */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-on-surface mb-4">Modifications apportées à ce document</h2>
            <p className="text-on-surface-variant mb-3">Ce document peut être mis à jour périodiquement pour refléter l'évolution du service ou des obligations légales. En cas de modification substantielle, les utilisateurs seront informés par email à l'adresse associée à leur compte afin d'être tenus au courant des changements et, le cas échéant, de pouvoir retirer leur consentement.</p>
            <p className="text-on-surface-variant">La version mise en ligne et consultable sur le site fait foi.</p>
          </section>

          <div className="border-t border-outline pt-6 mt-8">
            <p className="text-sm text-on-surface-variant">
              Dernière mise à jour : 01 janvier 2026
            </p>
            <button
                data-testid="link-home"
              onClick={() => nav('/')}
              className="mt-4 px-6 py-2 bg-primary text-on-primary rounded-full hover:opacity-95 transition-opacity">
              Retour à l'accueil
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-outline py-6 px-6 lg:px-14 flex flex-col sm:flex-row justify-between items-center text-sm text-on-surface-variant bg-surface">
        <span>© {new Date().getFullYear()} AidéO • Plateforme d'entraide communautaire pour aidants familiaux</span>
        <div className="flex gap-4 mt-2 sm:mt-0">
          <a href="/mentions-legales" className="hover:underline">Mentions légales</a>
          <a href="/confidentialite" className="hover:underline">Confidentialité</a>
          <a href="/contact" className="hover:underline">Contact</a>
        </div>
      </footer>
    </div>
  );
};

export default MentionsLegales;

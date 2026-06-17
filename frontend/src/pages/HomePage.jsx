import React, { useState, useEffect } from "react";
import {Link} from "react-router-dom";
import { useTheme } from '../contexts/ThemeContext.jsx';

const HomePage = () => {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [activeSection, setActiveSection] = useState("");

  // ScrollSpy: détecte la section active lors du scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['pour-qui', 'problemes', 'fonctionnalites', 'histoire', 'faq'];
      let currentSection = '';

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            currentSection = sectionId;
          }
        }
      }

      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Barre de navigation */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-6 lg:px-14 py-4 bg-surface/90 backdrop-blur-md border-b border-outline">
        <div className="shrink-0">
          <img
            src={isDarkMode ? "/logo/logo_primaire_blanc.svg" : "/logo/logo_primaire_noire.svg"}
            alt="AidéO"
            className="h-10 w-auto max-w-full"
          />
        </div>

        <nav className="hidden md:flex gap-4">
          <button
            onClick={() => scrollToSection("pour-qui")}
            className={`text-on-surface-variant hover:text-on-surface transition-colors font-medium ${
              activeSection === 'pour-qui' ? 'text-primary border-b-2 border-primary pb-1' : ''
            }`}
          >
            Pour qui ?
          </button>
          <button
            onClick={() => scrollToSection("problemes")}
            className={`text-on-surface-variant hover:text-on-surface transition-colors font-medium ${
              activeSection === 'problemes' ? 'text-primary border-b-2 border-primary pb-1' : ''
            }`}
          >
            Problèmes
          </button>
          <button
            data-testid="nav-button-fonctionnalites"
            onClick={() => scrollToSection("fonctionnalites")}
            className={`text-on-surface-variant hover:text-on-surface transition-colors font-medium ${
              activeSection === 'fonctionnalites' ? 'text-primary border-b-2 border-primary pb-1' : ''
            }`}
          >
            Fonctionnalités
          </button>
          <button
            onClick={() => scrollToSection("histoire")}
            className={`text-on-surface-variant hover:text-on-surface transition-colors font-medium ${
              activeSection === 'histoire' ? 'text-primary border-b-2 border-primary pb-1' : ''
            }`}
          >
            Notre histoire
          </button>
          <button
            onClick={() => scrollToSection("faq")}
            className={`text-on-surface-variant hover:text-on-surface transition-colors font-medium ${
              activeSection === 'faq' ? 'text-primary border-b-2 border-primary pb-1' : ''
            }`}
          >
            FAQ
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-3 md:p-2 rounded-full bg-transparent text-on-surface hover:bg-surface-container-low transition-colors"
            aria-label="Toggle theme"
          >
            <img
              src={isDarkMode ? "/icons/dark_mode.svg" : "/icons/light_mode.svg"}
              alt={isDarkMode ? "Light mode" : "Dark mode"}
              className="w-6 h-6 md:w-5 md:h-5 opacity-70"
            />
          </button>

          <Link
            to="/login"
            className="md:hidden p-3 rounded-full hover:bg-surface-container-low transition-colors"
            aria-label="Profil"
          >
            <img
              src="/icons/person.svg"
              alt="Connexion/Inscription"
              className="w-7 h-7 invert-50"
            />
          </Link>

          <Link to={"/login"}
                data-testid="btn-login-1"
            className="hidden md:inline-flex px-4 py-2 rounded-full bg-transparent text-on-surface border border-outline hover:bg-surface-container-low transition-colors"
          >
            Se connecter
          </Link>
          <Link
              data-testid="link-register-1"
            to={"/register"}
            className="hidden md:inline-flex px-4 py-2 rounded-full bg-primary text-on-primary shadow-lg hover:opacity-95 transition-colors"
          >
            Créer un compte
          </Link>
        </div>
      </header>

      {/* SECTION HERO */}
      <main>
        <section className="grid grid-cols-1 lg:grid-cols-[2fr_1.5fr] gap-10 px-6 lg:px-14 py-20 items-center bg-background">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight text-on-surface">
              AidéO : L'entraide communautaire pour les aidants familiaux
            </h1>
            <p className="text-lg text-on-surface-variant mb-8 max-w-2xl">
              Simplifiez votre quotidien en mutualisant les tâches avec d'autres aidants de votre communauté locale.
              Gagnez du temps et bénéficiez d'avantages partenaires grâce à notre système de récompenses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                  data-testid="link-register-2"
                to={"/register"}
                className="px-6 py-3 rounded-full bg-primary text-on-primary shadow-lg hover:opacity-95 transition-colors text-center"
              >
                Rejoindre la communauté
              </Link>
              <Link
                  data-testid="btn-login-2"
                to={"/login"}
                className="px-6 py-3 rounded-full bg-transparent text-on-surface border border-outline hover:bg-surface-container-low transition-colors text-center"
              >
                Se connecter
              </Link>
            </div>

            <p className="mt-6 text-sm text-on-surface-variant">
               Inscription gratuite • Communauté locale • Avantages partenaires
            </p>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-lg border border-outline">
            <div className="inline-block px-3 py-1 rounded-full bg-primary-container text-on-primary-container text-sm font-medium mb-4">
              Exemple d'entraide locale
            </div>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center gap-2 text-sm text-on-surface">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                Courses partagées avec Marie (à 500m)
              </li>
              <li className="flex items-center gap-2 text-sm text-on-surface">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                Covoiturage pour rendez-vous médical
              </li>
              <li className="flex items-center gap-2 text-sm text-on-surface">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                Aide ponctuelle pour jardinage
              </li>
              <li className="flex items-center gap-2 text-sm text-on-surface">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                Échange de services • +50 points gagnés
              </li>
            </ul>
            <div className="text-sm text-on-surface-variant">
              Découvrez les services près de chez vous et contribuez à votre communauté.
            </div>
          </div>
        </section>

        {/* POUR QUI */}
        <section id="pour-qui" className="py-20 px-6 lg:px-14 bg-surface">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4 text-on-surface">Pour qui est faite AidéO ?</h2>
            <p className="text-lg text-on-surface-variant mb-8 max-w-3xl mx-auto">
              AidéO s'adresse aux aidants familiaux accompagnant des personnes âgées, qui jonglent entre leurs responsabilités professionnelles, familiales et de soin.
              Notre plateforme élargit le soutien au-delà du cercle familial en créant une communauté d'entraide locale.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface-variant rounded-2xl border border-outline p-6">
                <h3 className="text-lg font-semibold mb-2 text-on-surface">Aidants familiaux</h3>
                <p className="text-on-surface-variant">Parents, enfants, conjoints accompagnant des seniors dans leur quotidien.</p>
              </div>
              <div className="bg-surface-variant rounded-2xl border border-outline p-6">
                <h3 className="text-lg font-semibold mb-2 text-on-surface">Communauté locale</h3>
                <p className="text-on-surface-variant">Voisins, amis et autres aidants partageant les mêmes défis dans votre quartier.</p>
              </div>
              <div className="bg-surface-variant rounded-2xl border border-outline p-6">
                <h3 className="text-lg font-semibold mb-2 text-on-surface">Partenaires locaux</h3>
                <p className="text-on-surface-variant">Commerces et entreprises soutenant l'entraide en offrant avantages et réductions.</p>
              </div>
            </div>
          </div>
        </section>

        {/* PROBLÈMES */}
        <section id="problemes" className="py-20 px-6 lg:px-14 bg-surface-variant">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8 text-on-surface">Les défis quotidiens des aidants</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface-container-lowest rounded-2xl border border-outline p-6">
                <h3 className="text-lg font-semibold mb-2 text-on-surface">Manque de temps</h3>
                <p className="text-on-surface-variant">
                  Entre travail, famille et soins, il est difficile de trouver du temps pour soi ou pour aider les autres.
                </p>
              </div>
              <div className="bg-surface-container-lowest rounded-2xl border border-outline p-6">
                <h3 className="text-lg font-semibold mb-2 text-on-surface">Isolement social</h3>
                <p className="text-on-surface-variant">
                  Les aidants se sentent souvent seuls face à leurs responsabilités, sans réseau de soutien local.
                </p>
              </div>
              <div className="bg-surface-container-lowest rounded-2xl border border-outline p-6">
                <h3 className="text-lg font-semibold mb-2 text-on-surface">Coûts élevés</h3>
                <p className="text-on-surface-variant">
                  Les services d'aide à domicile ou les courses répétées représentent une charge financière importante.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FONCTIONNALITÉS / BÉNÉFICES */}
        <section id="fonctionnalites" className="py-20 px-6 lg:px-14 bg-surface">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8 text-on-surface">Comment AidéO transforme votre quotidien</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface-variant rounded-2xl border border-outline p-6">
                <h3 className="text-lg font-semibold mb-2 text-on-surface">Mutualisation des tâches</h3>
                <p className="text-on-surface-variant">
                  Proposez ou demandez des services (courses, covoiturage, aide ponctuelle) auprès d'autres aidants de votre communauté locale.
                </p>
              </div>
              <div className="bg-surface-variant rounded-2xl border border-outline p-6">
                <h3 className="text-lg font-semibold mb-2 text-on-surface">Système de récompenses</h3>
                <p className="text-on-surface-variant">
                  Chaque acte d'entraide est récompensé par des points échangeables contre avantages et réductions chez nos partenaires locaux.
                </p>
              </div>
              <div className="bg-surface-variant rounded-2xl border border-outline p-6">
                <h3 className="text-lg font-semibold mb-2 text-on-surface">Carte interactive locale</h3>
                <p className="text-on-surface-variant">
                  Visualisez et localisez géographiquement les services demandés ou proposés, renforçant l'esprit de communauté.
                </p>
              </div>
              <div className="bg-surface-variant rounded-2xl border border-outline p-6">
                <h3 className="text-lg font-semibold mb-2 text-on-surface">Simplicité d'utilisation</h3>
                <p className="text-on-surface-variant">
                  Interface claire, guidée et rapide pour une faible charge de travail, adaptée aux aidants pressés.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* AVANT / APRÈS */}
        <section className="py-20 px-6 lg:px-14 bg-surface-variant">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold mb-4 text-on-surface">Avant AidéO</h2>
                <ul className="space-y-2 text-on-surface-variant">
                  <li>Tâches quotidiennes assumées seul(e)</li>
                  <li>Difficulté à trouver du temps libre</li>
                  <li>Sentiment d'isolement dans l'accompagnement</li>
                  <li>Coûts élevés pour les services externes</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4 text-on-surface">Avec AidéO</h2>
                <ul className="space-y-2 text-on-surface-variant">
                  <li>Mutualisation des tâches avec la communauté</li>
                  <li>Gain de temps grâce à l'entraide locale</li>
                  <li>Réseau de soutien et réduction de l'isolement</li>
                  <li>Économies grâce aux récompenses partenaires</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* RÉASSURANCE / DONNÉES */}
        <section className="py-20 px-6 lg:px-14 bg-surface">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4 text-on-surface">Une communauté de confiance</h2>
            <p className="text-lg text-on-surface-variant mb-6">
              AidéO s'engage à créer un environnement sûr et solidaire pour tous les aidants.  
              Notre modération interne garantit l'équité et la qualité des échanges.
            </p>
            <ul className="space-y-2 text-on-surface-variant">
              <li>Vérification des profils et modération des services</li>
              <li>Respect strict du RGPD et protection des données personnelles</li>
              <li>Communauté locale limitée pour plus de sécurité</li>
            </ul>
          </div>
        </section>

        {/* NOTRE HISTOIRE */}
        <section id="histoire" className="py-20 px-6 lg:px-14 bg-surface-variant">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4 text-on-surface">Notre mission : Transformer l'accompagnement des seniors</h2>
            <p className="text-lg text-on-surface-variant">
              AidéO est née de la conviction que l'entraide communautaire peut révolutionner le quotidien des aidants familiaux.
              Au-delà du cercle familial, nous créons des liens locaux durables, favorisant la solidarité et l'échange de services.
              Notre plateforme web, développée avec Symfony et React, garantit performance et sécurité pour une expérience utilisateur optimale.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20 px-6 lg:px-14 bg-surface">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8 text-on-surface">Questions fréquentes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface-variant rounded-2xl border border-outline p-6">
                <h3 className="text-lg font-semibold mb-2 text-on-surface">Comment gagner des points ?</h3>
                <p className="text-on-surface-variant">
                  Chaque service rendu à un autre aidant vous rapporte des points, échangeables contre avantages partenaires.
                </p>
              </div>
              <div className="bg-surface-variant rounded-2xl border border-outline p-6">
                <h3 className="text-lg font-semibold mb-2 text-on-surface">La plateforme est-elle payante ?</h3>
                <p className="text-on-surface-variant">
                  L'inscription et l'utilisation de base sont gratuites. Seuls les avantages partenaires peuvent nécessiter des points.
                </p>
              </div>
              <div className="bg-surface-variant rounded-2xl border border-outline p-6">
                <h3 className="text-lg font-semibold mb-2 text-on-surface">Comment assurer la sécurité ?</h3>
                <p className="text-on-surface-variant">
                  Nous vérifions tous les profils et modérons les échanges. La communauté est limitée à votre zone locale.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="py-20 px-6 lg:px-14 bg-linear-to-br from-primary-container to-tertiary-container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4 text-on-primary dark:text-on-primary">Rejoignez la révolution de l'entraide communautaire</h2>
            <p className="text-lg text-on-primary/80 dark:text-on-primary/90 mb-8">
              AidéO n'est pas qu'une plateforme ; c'est un engagement à transformer le quotidien des aidants familiaux par l'innovation sociale et technologique.
              Créez votre compte dès maintenant et découvrez le pouvoir de la communauté.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                  data-testid="link-register-3"
                to={"/register"}
                className="px-6 py-3 rounded-full bg-primary text-on-primary shadow-lg hover:opacity-95 transition-colors text-center"
              >
                Créer mon compte gratuit
              </Link>
              <Link
                  data-testid="btn-login-3"
                to={"/login"}
                className="px-6 py-3 rounded-full bg-transparent text-on-primary dark:text-on-primary border border-outline hover:bg-primary/10 dark:hover:bg-on-primary/10 transition-colors text-center"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-outline py-6 px-6 lg:px-14 flex flex-col sm:flex-row justify-between items-center text-sm text-on-surface-variant bg-surface-dim">
        <span>© {new Date().getFullYear()} AidéO • Plateforme d'entraide communautaire pour aidants familiaux</span>
        <div className="flex gap-4 mt-2 sm:mt-0">
          <Link data-testid="link-ML" to={"/mentions-legales"} className="hover:underline">Mentions légales</Link>
          <Link data-testid="link-conf" to={"/confidentialite"} className="hover:underline">Confidentialité</Link>
          <Link data-testid="link-contact" to={"/contact"} className="hover:underline">Contact</Link>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;


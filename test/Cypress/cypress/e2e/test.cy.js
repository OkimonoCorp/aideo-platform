/*describe("Test sur la page principale", () => {
    beforeEach('Visiter la page principale',() => {
        cy.visit('/') // Permet d'aller à la page principale
    });
    it("Contenu de la page", () => {
        cy.contains('AidéO : L\'entraide communautaire pour les aidants familiaux') // Permet de savoir si la page contient bien certaines infos
    })
    it("Devrait déplacer la page et son contenu", () => {
        cy.get('[data-testid="nav-button-fonctionnalites"]').click();
        cy.contains('Système de récompenses');
    })
    it("Devrait ouvrir la page des mentions légales", () => {
        cy.get('[data-testid="link-ML"]').click();
        cy.contains('utilisation de la plateforme.')
        cy.get('[data-testid="link-home"]').click();
        cy.contains('échangeables contre')
    })
    it("Devrait ouvrir la page de confidentialité", () => {
        cy.get('[data-testid="link-conf"]').click();
        cy.contains(' Le cookie expire')
        cy.get('[data-testid="btn-home-conf"]').click();
        cy.contains('professionnelles, familiales')
    })
    it("Devrait ouvrir la page d'erreur 404", () => {
        cy.get('[data-testid="link-contact"]').click();
        cy.contains('Page non trouvée')
        cy.get('[data-testid="btn-home-error"]').click();
        cy.contains('Respect strict du RGPD')
    })
    it("Devrait ouvrir la page d'authentification", () => {
        cy.get('[data-testid="btn-login-1"]').click();
        cy.contains('Connectez Vous')
        cy.visit('/')
        cy.get('[data-testid="btn-login-2"]').click();
        cy.contains('Connectez Vous')
        cy.visit('/')
        cy.get('[data-testid="btn-login-3"]').click();
        cy.contains('Connectez Vous')
    })
    it("Devrait ouvrir la page de creation de compte", () => {
        cy.get('[data-testid="link-register-1"]').click();
        cy.contains('Créer un compte')
        cy.visit('/')
        cy.get('[data-testid="link-register-2"]').click();
        cy.contains('Créer un compte')
        cy.visit('/')
        cy.get('[data-testid="link-register-3"]').click();
        cy.contains('Créer un compte')
    })
})*/

/*
describe("Test sur la page de login", () => {
    beforeEach('Visiter la page de login', () => {
        cy.visit('/login')
    })
    it("Devrait remplir l'identifiant et le mdp et se connecter", () => {
        cy.get('[data-testid="field-identifiant"]').find('input').type("jean@test.com");
        cy.get('[data-testid="field-mdp"]').find('input').type("1");
        cy.get('[data-testid="button-connect-login"]').click();
        cy.contains('Informations Personnelles')
    });
});*/

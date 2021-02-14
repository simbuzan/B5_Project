describe('Smoke Tests', () => {
    it('Landing page opens', () => {
        cy.visit('/');
    });

    it('Log in page opens', () => {
        cy.visit('/');
        cy.get('.nav-item').contains('Log in').click();
        cy.url().should('contain','/user/login');
    });

    it('Logo redirects to landing page', () => {
        cy.get('.navbar-brand').contains('ReMatch').click();
        cy.url().should('contain', '/');     
    });

    it('Sign up page opens', () => {
        cy.get('.nav-link').contains('Sign up as job seeker').click();
        cy.url().should('contain', '/signup/candidate');
    });

    it('Sign up buttons redirect to the same page', () => {
        cy.visit('/');
        cy.get('.btn').contains('Get your dream job').click();
        cy.wait(1000);
        cy.url().should('contain', '/signup/candidate');
        cy.get('.modal-content').should('contain', 'Disclaimer');
        cy.get('.btn').contains('Close').click();
        cy.get('.nav-link').contains('Sign up as job seeker').click();
        cy.url().should('contain', '/signup/candidate');
    });
});
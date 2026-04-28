import React, { useState } from 'react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg border-b border-neutral-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-primary-600">EspaceCall</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block flex-grow ml-8">
            <div className="flex items-center gap-8">
              <a href="/" className="text-sm font-medium text-neutral-600 hover:text-primary-700 transition-colors">
                Accueil
              </a>
              <a href="/repair" className="text-sm font-medium text-neutral-600 hover:text-primary-700 transition-colors">
                Nouvelle Réparation
              </a>
              <a href="/track" className="text-sm font-medium text-neutral-600 hover:text-primary-700 transition-colors">
                Suivre Réparation
              </a>
              <a href="/booking" className="text-sm font-medium text-neutral-600 hover:text-primary-700 transition-colors">
                Prendre Rendez-vous
              </a>
            </div>
          </div>

          {/* Right side - Tagline and Mobile Menu Button */}
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-xs md:text-sm text-neutral-600 text-right">
              Service de réparation téléphonique et informatique
            </span>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 focus:outline-none"
              aria-expanded={isMobileMenuOpen}
              aria-label="Ouvrir le menu principal"
            >
              {!isMobileMenuOpen ? (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <a 
              href="/" 
              className="block px-3 py-2 rounded-md text-base font-medium text-neutral-600 hover:text-primary-700 hover:bg-primary-50 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Accueil
            </a>
            <a 
              href="/repair" 
              className="block px-3 py-2 rounded-md text-base font-medium text-neutral-600 hover:text-primary-700 hover:bg-primary-50 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Nouvelle Réparation
            </a>
            <a 
              href="/track" 
              className="block px-3 py-2 rounded-md text-base font-medium text-neutral-600 hover:text-primary-700 hover:bg-primary-50 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Suivre Réparation
            </a>
            <a 
              href="/booking" 
              className="block px-3 py-2 rounded-md text-base font-medium text-neutral-600 hover:text-primary-700 hover:bg-primary-50 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Prendre Rendez-vous
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
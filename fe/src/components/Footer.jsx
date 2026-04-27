import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-neutral-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">YH38</h3>
            <p className="text-neutral-300 text-sm leading-relaxed">
              Service professionnel de réparation de téléphones et ordinateurs.
              Nous réparons votre matériel rapidement et efficacement.
            </p>
          </div>
          <div>
            <h4 className="text-md font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li>Réparation de téléphones</li>
              <li>Réparation d'ordinateurs</li>
              <li>Diagnostic gratuit</li>
              <li>Garantie sur les réparations</li>
            </ul>
          </div>
          <div>
            <h4 className="text-md font-semibold mb-4">Contact</h4>
            <div className="space-y-2 text-sm text-neutral-300">
              <p>📞 Téléphone: +33 1 23 45 67 89</p>
              <p>📧 Email: contact@yh38.fr</p>
              <p>📍 Adresse: 123 Rue de la Réparation, Paris</p>
              <p>🕒 Horaires: Lun-Ven 9h-18h</p>
            </div>
          </div>
        </div>
        <div className="border-t border-neutral-700 mt-8 pt-6 text-center text-sm text-neutral-400">
          <p>&copy; 2024 YH38. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
import React from 'react';
import Layout from './components/Layout';
import Button from './components/Button';

function App() {
  const steps = [
    {
      number: 1,
      title: 'Créer un ticket',
      description: 'Décrivez votre problème et recevez un code de suivi unique',
      icon: '📝',
      details: 'Remplissez le formulaire simple en quelques minutes'
    },
    {
      number: 2,
      title: 'Diagnostic',
      description: 'Notre équipe examine votre appareil rapidement',
      icon: '🔍',
      details: 'Diagnostic gratuit et sans engagement'
    },
    {
      number: 3,
      title: 'Réparation',
      description: 'Nous réparons votre appareil avec qualité',
      icon: '🔧',
      details: 'Pièces de qualité et garantie sur les réparations'
    },
    {
      number: 4,
      title: 'Récupération',
      description: 'Votre appareil est prêt pour la récupération',
      icon: '✅',
      details: 'Suivi en temps réel de votre réparation'
    }
  ];

  const services = [
    {
      icon: '📱',
      title: 'Téléphones',
      description: 'Réparation d\'écrans, batteries, haut-parleurs et autres composants.'
    },
    {
      icon: '💻',
      title: 'Ordinateurs',
      description: 'Maintenance, réparation et optimisation de vos ordinateurs.'
    },
    {
      icon: '⚡',
      title: 'Service Express',
      description: 'Diagnostic gratuit et réparation rapide sous 24-48h.'
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-white pt-16 md:pt-24 pb-20 md:pb-28">
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-primary-50 -z-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary-900 mb-6 leading-tight">
              EspaceCall - Réparation Express
            </h1>
            
            <p className="text-lg md:text-xl mb-4 text-secondary-700 max-w-3xl mx-auto">
              Service professionnel de réparation de téléphones et ordinateurs
            </p>
            
            <p className="text-base md:text-lg mb-10 text-secondary-600 max-w-3xl mx-auto">
              Diagnostic rapide, réparation de qualité et suivi en temps réel. 
              Apportez votre appareil ou prenez rendez-vous en ligne.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="large" 
                onClick={() => window.location.href = '/repair'}
              >
                Nouvelle Réparation
              </Button>
              <Button 
                variant="outline" 
                size="large" 
                onClick={() => window.location.href = '/track'}
                className="transition-transform transform hover:scale-105"
              >
                Suivre ma Réparation
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-20 bg-primary-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Nos Services
            </h2>
            <div className="h-1 w-16 bg-primary-600 mx-auto rounded-full mb-6"></div>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
              Nous réparons tous types d'appareils avec professionnalisme et rapidité
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div 
                key={index}
                className="card text-center hover:shadow-lg transition-shadow duration-300 focus-within:ring-2 focus-within:ring-primary-500"
              >
                <div className="mx-auto w-16 h-16 mb-6 flex items-center justify-center bg-primary-100 rounded-full text-3xl">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Comment ça marche ?
            </h2>
            <div className="h-1 w-16 bg-primary-600 mx-auto rounded-full mb-6"></div>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
              Quatre étapes simples pour réparer votre appareil
            </p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-neutral-200 -translate-y-1/2 -z-10"></div>
            {steps.map((step, index) => (
              <div 
                key={step.number}
                className="card bg-white hover:shadow-lg transition-shadow duration-300 text-center"
              >
                {/* Step Number Circle */}
                <div className="relative w-16 h-16 mx-auto mb-6 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-xl min-h-11 min-w-11 z-10">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="text-4xl mb-4">
                  {step.icon}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-secondary-900 mb-3">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-neutral-600 text-sm mb-3 leading-relaxed">
                  {step.description}
                </p>

                {/* Details */}
                <p className="text-xs text-neutral-500 italic">
                  {step.details}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-16 md:py-20 bg-primary-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '⏱️', title: 'Rapide', desc: 'Réparation en 24-48h' },
              { icon: '✨', title: 'Qualité', desc: 'Pièces d\'origine garanties' },
              { icon: '🛡️', title: 'Sécurisé', desc: 'Vos données sont protégées' },
              { icon: '💬', title: 'Support', desc: 'Suivi en temps réel' }
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-2xl shadow-sm border border-neutral-200/80">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-bold text-secondary-900 mb-2">{feature.title}</h3>
                <p className="text-neutral-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-secondary-800 text-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Prêt à réparer votre appareil ?
          </h2>
          <p className="text-lg mb-8 text-primary-100 max-w-2xl mx-auto">
            Commencez dès maintenant en créant un ticket de réparation ou en prenant rendez-vous.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="large" 
              onClick={() => window.location.href = '/repair'}
              className="bg-primary-600 hover:bg-primary-700"
            >
              Créer un Ticket
            </Button>
            <Button 
              size="large" 
              onClick={() => window.location.href = '/booking'}
              className="bg-white text-secondary-800 hover:bg-neutral-100"
            >
              Prendre Rendez-vous
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ / Support Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-secondary-900 text-center mb-12">
            Questions Fréquentes
          </h2>

          <div className="space-y-6">
            {[
              {
                q: 'Quel est le coût d\'une réparation ?',
                a: 'Les prix varient selon l\'appareil et le type de réparation. Nous offrons un diagnostic gratuit sans engagement.'
              },
              {
                q: 'Recevrai-je un code de suivi ?',
                a: 'Oui, vous recevrez un code unique pour suivre votre réparation en temps réel.'
              },
              {
                q: 'Quelle est la durée moyenne d\'une réparation ?',
                a: 'Généralement 24-48 heures. Les réparations urgentes peuvent être complétées plus rapidement.'
              },
              {
                q: 'Offrez-vous une garantie ?',
                a: 'Oui, toutes nos réparations incluent une garantie de 3 mois.'
              }
            ].map((item, index) => (
              <div key={index} className="card">
                <h3 className="font-bold text-secondary-900 mb-2">{item.q}</h3>
                <p className="text-neutral-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default App;
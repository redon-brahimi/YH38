import React, { useState } from 'react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Input from '../components/Input';
import Breadcrumbs from '../components/Breadcrumbs';
import toast from 'react-hot-toast';

const RepairForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    device_type: '',
    device_model: '',
    issue_description: '',
    priority: 'normal'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trackingCode, setTrackingCode] = useState(null);

  const steps = [
    { id: 1, title: 'Informations Client', description: 'Vos coordonnées' },
    { id: 2, title: 'Appareil', description: 'Type et modèle' },
    { id: 3, title: 'Problème', description: 'Description du problème' },
    { id: 4, title: 'Confirmation', description: 'Vérification et envoi' }
  ];

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.client_name.trim()) newErrors.client_name = 'Le nom est requis';
        if (!formData.client_email.trim()) newErrors.client_email = 'L\'email est requis';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.client_email)) {
          newErrors.client_email = 'Format d\'email invalide';
        }
        if (!formData.client_phone.trim()) newErrors.client_phone = 'Le téléphone est requis';
        break;
      case 2:
        if (!formData.device_type) newErrors.device_type = 'Le type d\'appareil est requis';
        if (!formData.device_model.trim()) newErrors.device_model = 'Le modèle est requis';
        break;
      case 3:
        if (!formData.issue_description.trim()) {
          newErrors.issue_description = 'La description du problème est requise';
        } else if (formData.issue_description.trim().length < 10) {
          newErrors.issue_description = 'La description doit contenir au moins 10 caractères';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const submitForm = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:4000/api/repairs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setTrackingCode(data.repair.tracking_code);
        toast.success('Ticket de réparation créé avec succès!');
        setCurrentStep(5); // Success step
      } else {
        toast.error(data.error || 'Erreur lors de la création du ticket');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Informations Client</h2>
              <p className="text-neutral-600">Veuillez saisir vos coordonnées pour créer votre ticket</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nom complet"
                type="text"
                placeholder="Jean Dupont"
                value={formData.client_name}
                onChange={(e) => updateFormData('client_name', e.target.value)}
                error={errors.client_name}
                required
              />

              <Input
                label="Email"
                type="email"
                placeholder="jean@example.com"
                value={formData.client_email}
                onChange={(e) => updateFormData('client_email', e.target.value)}
                error={errors.client_email}
                required
              />

              <Input
                label="Téléphone"
                type="tel"
                placeholder="+33 1 23 45 67 89"
                value={formData.client_phone}
                onChange={(e) => updateFormData('client_phone', e.target.value)}
                error={errors.client_phone}
                required
                className="md:col-span-2"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Informations sur l'Appareil</h2>
              <p className="text-neutral-600">Décrivez l'appareil à réparer</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Type d'appareil <span className="text-error-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => { updateFormData('device_type', 'phone'); if(errors.device_type) setErrors(p => ({...p, device_type: ''})); }}
                    className={`p-6 border-2 rounded-2xl text-center transition-all duration-200 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                      formData.device_type === 'phone'
                        ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-md ring-1 ring-primary-500'
                        : 'border-neutral-200 bg-white hover:border-primary-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="text-5xl mb-3">📱</div>
                    <div className="font-medium">Téléphone</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => { updateFormData('device_type', 'pc'); if(errors.device_type) setErrors(p => ({...p, device_type: ''})); }}
                    className={`p-6 border-2 rounded-2xl text-center transition-all duration-200 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                      formData.device_type === 'pc'
                        ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-md ring-1 ring-primary-500'
                        : 'border-neutral-200 bg-white hover:border-primary-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="text-5xl mb-3">💻</div>
                    <div className="font-medium">Ordinateur</div>
                  </button>
                </div>
                {errors.device_type && (
                  <p className="mt-1 text-sm text-error-600">{errors.device_type}</p>
                )}
              </div>

              <Input
                label="Modèle de l'appareil"
                type="text"
                placeholder={formData.device_type === 'phone' ? 'iPhone 12, Samsung Galaxy S21...' : 'Dell XPS 13, MacBook Pro...'}
                value={formData.device_model}
                onChange={(e) => updateFormData('device_model', e.target.value)}
                error={errors.device_model}
                required
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Description du Problème</h2>
              <p className="text-neutral-600">Décrivez précisément le problème rencontré</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Description détaillée <span className="text-error-500">*</span>
                </label>
                <textarea
                  placeholder="Décrivez le problème que vous rencontrez avec votre appareil. Soyez le plus précis possible pour nous aider à diagnostiquer rapidement."
                  value={formData.issue_description}
                  onChange={(e) => updateFormData('issue_description', e.target.value)}
                  className="input-field w-full h-32 resize-none"
                  required
                />
                {errors.issue_description && (
                  <p className="mt-1 text-sm text-error-600">{errors.issue_description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Priorité
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'low', label: 'Faible', desc: 'Pas urgent' },
                    { value: 'normal', label: 'Normal', desc: 'Délai standard' },
                    { value: 'high', label: 'Élevé', desc: 'Assez urgent' },
                    { value: 'urgent', label: 'Urgent', desc: 'Très urgent' }
                  ].map((priority) => (
                    <button //
                      key={priority.value}
                      type="button"
                      onClick={() => updateFormData('priority', priority.value)}
                      className={`p-3 border-2 rounded-xl text-center transition-all duration-200 min-h-11 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                        formData.priority === priority.value
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-neutral-300 hover:border-primary-300'
                      }`}
                    >
                      <div className="font-medium">{priority.label}</div>
                      <div className="text-xs text-neutral-600">{priority.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Confirmation</h2>
              <p className="text-neutral-600">Vérifiez vos informations avant envoi</p>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Récapitulatif</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Client:</span>
                  <span className="font-medium">{formData.client_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Email:</span>
                  <span className="font-medium break-all">{formData.client_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Téléphone:</span>
                  <span className="font-medium">{formData.client_phone}</span>
                </div>
                <div className="border-t border-neutral-200/80 my-3"></div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Appareil:</span>
                  <span className="font-medium">{formData.device_type === 'phone' ? 'Téléphone' : 'Ordinateur'} {formData.device_model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Priorité:</span>
                  <span className="font-medium capitalize bg-primary-50 text-primary-700 px-2 py-0.5 rounded-md text-sm">{formData.priority}</span>
                </div>
                <div className="border-t border-neutral-200/80 pt-4">
                  <div className="text-neutral-600 mb-2">Problème:</div>
                  <p className="text-sm bg-neutral-50 p-3 rounded-lg border border-neutral-200/80">{formData.issue_description}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="text-center space-y-6">
            <div className="text-7xl mb-4 animate-bounce">✅</div>
            <h2 className="text-2xl font-bold text-success-700 mb-2">Ticket Créé avec Succès !</h2>
            <p className="text-neutral-600 mb-6">
              Votre ticket de réparation a été enregistré. Conservez précieusement ce code de suivi.
            </p>

            <div className="card inline-block bg-success-50/50 border-success-200">
              <div className="text-sm text-neutral-600 mb-2">Code de suivi</div>
              <div className="text-2xl md:text-3xl font-bold text-success-800 font-mono bg-white px-4 py-2 rounded-lg border-2 border-dashed border-success-300">
                {trackingCode}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-neutral-600">
                Vous pouvez suivre l'état de votre réparation à tout moment.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => window.location.href = `/track?code=${trackingCode}`}>
                  Suivre ma Réparation
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/booking'}>
                  Prendre Rendez-vous
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Subtle decorative background blob */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[400px] bg-primary-50/60 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        {currentStep < 5 && (
          <Breadcrumbs steps={steps} currentStep={currentStep} />
        )}

        <div className="mt-8">
          {renderStepContent()}
        </div>

        {currentStep < 5 && (
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Précédent
            </Button>

            <Button
              onClick={currentStep === 4 ? submitForm : nextStep}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Envoi en cours...' : currentStep === 4 ? 'Créer le Ticket' : 'Suivant'}
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RepairForm;
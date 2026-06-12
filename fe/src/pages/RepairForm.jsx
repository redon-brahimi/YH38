import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import Breadcrumbs from '../components/Breadcrumbs';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext.jsx';

const issueTypes = [
  { key: 'ecran', label: 'Écran' },
  { key: 'batterie', label: 'Batterie' },
  { key: 'camera_arriere', label: 'Caméra Arrière' },
  { key: 'camera_avant', label: 'Caméra Avant' },
  { key: 'connecteur', label: 'Connecteur de charge' },
  { key: 'arriere', label: 'Vitre Arrière' },
  { key: 'boutons', label: 'Boutons' },
  { key: 'micro', label: 'Micro' },
  { key: 'haut_parleur', label: 'Haut-Parleur' },
  { key: 'ecouteur_interne', label: 'Écouteur Interne' },
  { key: 'lecteur_sim', label: 'Lecteur SIM' },
  { key: 'capteur_proximite', label: 'Capteur de Proximité' },
  { key: 'flash', label: 'Flash' },
];

const RepairForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const { user, authFetch } = useAuth();
  const [formData, setFormData] = useState({
    device_type: '',
    device_model: '',
    issue_type: '',
    issue_description: '',
    priority: 'normal'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trackingCode, setTrackingCode] = useState(null);
  const [partAvailability, setPartAvailability] = useState(null);
  const [isCheckingPart, setIsCheckingPart] = useState(false);

  const steps = [
    { id: 1, title: 'Appareil', description: 'Type et modèle', progress: 33 },
    { id: 2, title: 'Problème', description: 'Description du problème', progress: 66 },
    { id: 3, title: 'Confirmation', description: 'Vérification et envoi', progress: 100 }
  ];

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (field === 'issue_type') {
      setPartAvailability(null); // Reset on new issue selection
    }
  };

  // Effect to check part availability
  useEffect(() => {
    const checkPart = async () => {
      if (formData.device_model && formData.issue_type) {
        setIsCheckingPart(true);
        setPartAvailability(null);
        try {
          const response = await authFetch('http://localhost:4000/api/admin/parts/check-availability', {
            method: 'POST',
            body: JSON.stringify({
              device_model: formData.device_model,
              issue_type: formData.issue_type,
            }),
          });
          const data = await response.json();
          if (data.success) {
            setPartAvailability({ available: data.available, message: data.message });
          } else {
            setPartAvailability({ available: false, message: data.error || 'Erreur lors de la vérification.' });
          }
        } catch (err) {
          setPartAvailability({ available: false, message: 'Erreur de connexion au serveur.' });
        } finally {
          setIsCheckingPart(false);
        }
      }
    };
    checkPart();
  }, [formData.device_model, formData.issue_type, authFetch]);
  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.device_type) newErrors.device_type = 'Le type d\'appareil est requis';
        if (!formData.device_model.trim()) newErrors.device_model = 'Le modèle est requis';
        break;
      case 2:
        if (!formData.issue_type) {
          newErrors.issue_type = 'Veuillez sélectionner le type de problème.';
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
      const response = await authFetch('http://localhost:4000/api/repairs', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setTrackingCode(data.repair.tracking_code);
        toast.success('Ticket de réparation créé avec succès!');
        setCurrentStep(4);
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

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Quel est le problème ?</h2>
              <p className="text-neutral-600">Sélectionnez le problème principal de votre appareil.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Type de problème <span className="text-error-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {issueTypes.map((issue) => (
                    <button
                      key={issue.key}
                      type="button"
                      onClick={() => updateFormData('issue_type', issue.key)}
                      className={`p-3 border-2 rounded-xl text-center transition-all duration-200 min-h-11 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                        formData.issue_type === issue.key
                          ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-md'
                          : 'border-neutral-300 hover:border-primary-300'
                      }`}
                    >
                      <div className="font-medium text-sm">{issue.label}</div>
                    </button>
                  ))}
                </div>
                {errors.issue_type && (
                  <p className="mt-2 text-sm text-error-600">{errors.issue_type}</p>
                )}
              </div>

              {isCheckingPart && (
                <div className="text-center text-neutral-600">Vérification du stock...</div>
              )}

              {partAvailability && (
                <div className={`p-4 rounded-lg text-sm ${
                  partAvailability.available
                    ? 'bg-success-50 text-success-800 border border-success-200'
                    : 'bg-warning-50 text-warning-800 border border-warning-200'
                }`}>
                  {partAvailability.message}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Détails supplémentaires (optionnel)
                </label>
                <textarea
                  placeholder="Si vous avez d'autres problèmes ou des détails à ajouter, décrivez-les ici."
                  value={formData.issue_description}
                  onChange={(e) => updateFormData('issue_description', e.target.value)}
                  className="input-field w-full h-24 resize-none"
                />
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
                    <button
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

      case 3:
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
                  <span className="font-medium">{user?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Email:</span>
                  <span className="font-medium break-all">{user?.email}</span>
                </div>
                <div className="border-t border-neutral-200/80 my-3"></div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Appareil:</span>
                  <span className="font-medium">{formData.device_type === 'phone' ? 'Téléphone' : 'Ordinateur'} {formData.device_model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Problème principal:</span>
                  <span className="font-medium">{issueTypes.find(i => i.key === formData.issue_type)?.label || 'Non spécifié'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Priorité:</span>
                  <span className="font-medium capitalize bg-primary-50 text-primary-700 px-2 py-0.5 rounded-md text-sm">{formData.priority}</span>
                </div>
                {formData.issue_description && (
                  <div className="border-t border-neutral-200/80 pt-4">
                    <div className="text-neutral-600 mb-2">Détails supplémentaires:</div>
                    <p className="text-sm bg-neutral-50 p-3 rounded-lg border border-neutral-200/80">{formData.issue_description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
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
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[400px] bg-primary-50/60 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        {currentStep < 5 && (
          <Breadcrumbs steps={steps} currentStep={currentStep} />
        )}

        {/* Progress Bar */}
        {currentStep < 4 && (
          <div className="mb-8">
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${steps.find(s => s.id === currentStep)?.progress || 0}%` }}
              ></div>
            </div>
            <p className="text-sm text-neutral-600 mt-2">Étape {currentStep} sur 3</p>
          </div>
        )}

        <div className="mt-8 card fade-in">
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
              onClick={currentStep === 3 ? submitForm : nextStep}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Envoi en cours...' : currentStep === 3 ? 'Créer le Ticket' : 'Suivant'}
            </Button>
          </div>
        )}
      </div>
  );
};

export default RepairForm;
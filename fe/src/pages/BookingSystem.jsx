import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const BookingSystem = () => {
  const [trackingCode, setTrackingCode] = useState('');
  const { authFetch, user } = useAuth();
  const [repair, setRepair] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingStep, setBookingStep] = useState(1); // 1: Find repair, 2: Select slot, 3: Confirm

  // Check for tracking code in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      setTrackingCode(code);
      handleFindRepair(code);
    }
  }, []);

  const handleFindRepair = async (code = trackingCode) => {
    if (!code.trim()) {
      toast.error('Veuillez saisir un code de suivi');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/repairs/${code}`);
      const data = await response.json();

      if (data.success) {
        setRepair(data.repair);
        // Optional: Check if the logged-in user owns this repair
        if (user && data.repair.client.email !== user.email) {
          toast.error("Ce ticket de réparation ne vous appartient pas.");
          // You might want to clear the repair state here
        }
        setBookingStep(2);
        toast.success('Réparation trouvée');
      } else {
        toast.error('Ticket non trouvé');
      }
    } catch (error) {
      console.error('Error finding repair:', error);
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  // Generate available time slots (9 AM to 6 PM, every 30 minutes)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          value: timeString,
          label: new Date(`1970-01-01T${timeString}`).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
          })
        });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Get next 14 days (excluding weekends)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date);
      }
    }

    return dates;
  };

  const availableDates = getAvailableDates();

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(''); // Reset time when date changes
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Veuillez sélectionner une date et une heure');
      return;
    }

    setLoading(true);
    try {
      const response = await authFetch('http://localhost:4000/api/appointments', {
        method: 'POST',
        body: JSON.stringify({
          repair_id: repair.id,
          appointment_date: selectedDate.toISOString().split('T')[0], // YYYY-MM-DD
          appointment_time: selectedTime,
          notes: notes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Rendez-vous programmé avec succès !');
        setBookingStep(3);
      } else {
        toast.error(data.error || 'Erreur lors de la programmation du rendez-vous');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Erreur de connexion lors de la programmation.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStepContent = () => {
    switch (bookingStep) {
      case 1:
        return (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Trouver votre Réparation</h2>
              <p className="text-neutral-600">Saisissez votre code de suivi pour prendre rendez-vous</p>
            </div>

            <Input
              label="Code de suivi"
              type="text"
              placeholder="YH38-000001"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
            />

            <Button
              onClick={() => handleFindRepair()}
              disabled={loading}
              className="w-full mt-4"
              size="large"
            >
              {loading ? 'Recherche...' : 'Continuer'}
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Choisir un Rendez-vous</h2>
              <p className="text-neutral-600">Sélectionnez une date et une heure pour votre réparation</p>
            </div>

            {/* Repair Summary */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Résumé de la Réparation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-neutral-500">Code de suivi</div>
                  <div className="font-mono font-semibold text-primary-700">{repair.tracking_code}</div>
                </div>
                <div>
                  <div className="text-sm text-neutral-500">Appareil</div>
                  <div className="font-medium">
                    {repair.device_type === 'phone' ? '📱 Téléphone' : '💻 Ordinateur'} {repair.device_model}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-neutral-500">Statut</div>
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 ring-1 ring-primary-500/20">{repair.status_french}</div>
                </div>
                <div>
                  <div className="text-sm text-neutral-500">Client</div>
                  <div className="font-medium">{repair.client.name}</div>
                </div>
              </div>
            </div>

            {/* Date Selection */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Choisir une Date</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableDates.map((date) => (
                  <button
                    key={date.toISOString()}
                    onClick={() => handleDateSelect(date)}
                    className={`p-4 border-2 rounded-2xl text-center transition-all duration-200 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                      selectedDate && selectedDate.toDateString() === date.toDateString()
                        ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-md ring-1 ring-primary-500'
                        : 'border-neutral-200 bg-white hover:border-primary-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="font-medium">
                      {date.toLocaleDateString('fr-FR', { weekday: 'short' })}
                    </div>
                    <div className="text-3xl font-bold my-1">
                      {date.getDate()}
                    </div>
                    <div className="text-sm text-neutral-600">
                      {date.toLocaleDateString('fr-FR', { month: 'short' })}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">
                  Choisir une Heure - {formatDate(selectedDate)}
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.value}
                      onClick={() => setSelectedTime(slot.value)}
                      className={`p-3 border-2 rounded-xl text-center transition-all duration-200 min-h-11 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                        selectedTime === slot.value
                          ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-md scale-105'
                          : 'border-neutral-200 bg-white hover:border-primary-300 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="font-medium">{slot.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedDate && selectedTime && (
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Informations Supplémentaires (Optionnel)</h3>
                <textarea
                  placeholder="Ajoutez toute information utile pour votre rendez-vous..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-field w-full h-24 resize-none"
                />
              </div>
            )}

            {/* Booking Button */}
            {selectedDate && selectedTime && (
              <div className="text-center">
                <div className="card inline-block mb-4">
                  <h4 className="font-semibold mb-2">Rendez-vous Confirmé</h4>
                  <div className="text-lg">
                    📅 {formatDate(selectedDate)}
                  </div>
                  <div className="text-lg">
                    🕐 {timeSlots.find(slot => slot.value === selectedTime)?.label}
                  </div>
                </div>
                {!user && <p className="text-sm text-warning-700 mt-2">Vous devez être connecté pour confirmer un rendez-vous.</p>}
                <Button
                  onClick={handleBooking}
                  disabled={loading}
                  size="large"
                >
                  {loading ? 'Programmation...' : 'Confirmer le Rendez-vous'}
                </Button>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="text-center space-y-6">
            <div className="text-7xl mb-4 animate-bounce">✅</div>
            <h2 className="text-2xl font-bold text-success-700 mb-2">Rendez-vous Programmée !</h2>
            <p className="text-neutral-600 mb-6">
              Votre rendez-vous a été enregistré avec succès.
            </p>

            <div className="card inline-block w-full max-w-md border-success-200 bg-success-50/50">
              <h3 className="text-lg font-semibold mb-4">Détails du Rendez-vous</h3>
              <div className="space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Date:</span>
                  <span className="font-medium">{formatDate(selectedDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Heure:</span>
                  <span className="font-medium">
                    {timeSlots.find(slot => slot.value === selectedTime)?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Réparation:</span>
                  <span className="font-medium">{repair.tracking_code}</span>
                </div>
                {notes && (
                  <div className="border-t pt-3">
                    <div className="text-neutral-600 mb-1">Notes:</div>
                    <div className="text-sm bg-neutral-50 p-2 rounded">{notes}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-neutral-600">
                Vous recevrez un email de confirmation. Apportez votre appareil et ce code de suivi.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => window.location.href = `/track?code=${repair.tracking_code}`}>
                  Voir le Suivi
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                  Retour à l'Accueil
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
        {/* Subtle decorative background blob */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[400px] bg-primary-50/60 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-neutral-600">
            <a href="/" className="hover:text-primary-600">Accueil</a>
            <span>/</span>
            <span className="text-neutral-900 font-medium">Prendre Rendez-vous</span>
          </nav>
        </div>

        {renderStepContent()}
      </div>
  );
};

export default BookingSystem;
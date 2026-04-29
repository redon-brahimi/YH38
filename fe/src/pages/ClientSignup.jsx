import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import Input from '@/components/Input.jsx';
import Button from '@/components/Button.jsx';
import toast from 'react-hot-toast';

const ClientSignup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Le nom est requis.';
    if (!formData.email) newErrors.email = 'L\'email est requis.';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'L\'adresse email est invalide.';
    if (!formData.password) newErrors.password = 'Le mot de passe est requis.';
    else if (formData.password.length < 6) newErrors.password = 'Le mot de passe doit faire au moins 6 caractères.';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const { confirmPassword, ...signupData } = formData;
      const response = await fetch('http://localhost:4000/api/auth/client/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
      });
      const data = await response.json();

      if (data.success) {
        login(data.user, data.token);
        toast.success('Inscription réussie ! Bienvenue.');
        navigate('/');
      } else {
        toast.error(data.error || 'Une erreur s\'est produite.');
      }
    } catch (error) {
      toast.error('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="max-w-md mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Créer un compte client</h2>
          <p className="mt-2 text-sm text-gray-600">
            Vous avez déjà un compte ?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Connectez-vous
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <Input name="name" type="text" label="Nom complet" value={formData.name} onChange={handleChange} error={errors.name} required />
          <Input name="email" type="email" label="Adresse email" value={formData.email} onChange={handleChange} error={errors.email} required />
          <Input name="phone" type="tel" label="Téléphone (Optionnel)" value={formData.phone} onChange={handleChange} />
          <Input name="password" type="password" label="Mot de passe" value={formData.password} onChange={handleChange} error={errors.password} required />
          <Input name="confirmPassword" type="password" label="Confirmer le mot de passe" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} required />
          <div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Création en cours...' : 'S\'inscrire'}
            </Button>
          </div>
        </form>
      </div>
  );
};

export default ClientSignup;
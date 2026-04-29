import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import Input from '@/components/Input.jsx';
import Button from '@/components/Button.jsx';
import toast from 'react-hot-toast';

const ClientLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:4000/api/auth/client/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (data.success) {
        login(data.user, data.token);
        toast.success('Connexion réussie !');
        navigate('/');
      } else {
        toast.error(data.error || 'Identifiants invalides.');
        setErrors({ form: data.error || 'Identifiants invalides.' });
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
          <h2 className="text-3xl font-bold text-gray-900">Connexion Client</h2>
          <p className="mt-2 text-sm text-gray-600">
            Pas encore de compte ?{' '}
            <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-500">
              Inscrivez-vous
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <Input name="email" type="email" label="Adresse email" value={formData.email} onChange={handleChange} required />
          <Input name="password" type="password" label="Mot de passe" value={formData.password} onChange={handleChange} required />
          {errors.form && <p className="text-sm text-error-600">{errors.form}</p>}
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link to="/admin/login" className="font-medium text-secondary-600 hover:text-secondary-500">
                Connexion Admin ?
              </Link>
            </div>
          </div>
          <div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Connexion...' : 'Se connecter'}
            </Button>
          </div>
        </form>
      </div>
  );
};

export default ClientLogin;
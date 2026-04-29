import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import Input from '@/components/Input.jsx';
import Button from '@/components/Button.jsx';
import toast from 'react-hot-toast';

const AdminSignup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'technician', // Default role
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth(); // Although we don't auto-login admins, useAuth is still useful for context
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
      const { confirmPassword, ...signupData } = formData; // Exclude confirmPassword from payload
      const response = await fetch('http://localhost:4000/api/auth/admin/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
      });
      const data = await response.json();

      if (data.success) {
        // For security, we don't auto-login admins after signup.
        // Instead, we redirect them to the admin login page.
        toast.success('Compte administrateur créé avec succès ! Veuillez vous connecter.');
        navigate('/admin/login');
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
          <h2 className="text-3xl font-bold text-gray-900">Créer un compte Administrateur</h2>
          <p className="mt-2 text-sm text-red-600 font-semibold">
            Attention: Cette page est réservée au développement.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <Input name="name" type="text" label="Nom complet" value={formData.name} onChange={handleChange} error={errors.name} required />
          <Input name="email" type="email" label="Adresse email" value={formData.email} onChange={handleChange} error={errors.email} required />
          <Input name="password" type="password" label="Mot de passe" value={formData.password} onChange={handleChange} error={errors.password} required />
          <Input name="confirmPassword" type="password" label="Confirmer le mot de passe" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} required />
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-neutral-700 mb-1">
              Rôle <span className="text-error-500">*</span>
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input-field"
            >
              <option value="technician">Technicien</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Création en cours...' : 'Créer le compte Admin'}
            </Button>
          </div>
        </form>
      </div>
  );
};

export default AdminSignup;
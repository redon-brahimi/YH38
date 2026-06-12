import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext.jsx';
import api from '@/utils/api.js';
import './SettingsPage.css'; // We'll add some basic styles

const SettingsPage = () => {
  const { user, setUser } = useAuth();

  // State for profile details form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // State for password change form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // State for user feedback messages
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  // Populate form with user data when the component loads
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMessage({ type: '', text: '' });
    try {
      const res = await api.put('/users/me', {
        name,
        phone,
        notification_preference: 'email', // Force email preference as SMS is removed
      });

      if (res.data.success) {
        setUser(prevUser => ({ ...prevUser, ...res.data.user })); // Update auth context
        setProfileMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Une erreur est survenue lors de la mise à jour du profil.';
      setProfileMessage({ type: 'error', text: errorMsg });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (newPassword !== confirmNewPassword) {
      setPasswordMessage({ type: 'error', text: 'Les nouveaux mots de passe ne correspondent pas.' });
      return;
    }

    try {
      const res = await api.put('/users/change-password', {
        currentPassword,
        newPassword,
      });

      if (res.data.success) {
        setPasswordMessage({ type: 'success', text: 'Mot de passe changé avec succès !' });
        // Clear password fields after successful change
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Une erreur est survenue lors du changement de mot de passe.';
      setPasswordMessage({ type: 'error', text: errorMsg });
    }
  };

  return (
    <div className="settings-container">
      <h1>Paramètres du compte</h1>

      {/* Profile Details Form */}
      <div className="settings-card">
        <h2>Informations du profil</h2>
        <form onSubmit={handleProfileUpdate}>
          <div className="form-group">
            <label htmlFor="name">Nom complet</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Adresse e-mail</label>
            <input id="email" type="email" value={email} disabled />
            <small>L'adresse e-mail ne peut pas être modifiée.</small>
          </div>
          <div className="form-group">
            <label htmlFor="phone">Numéro de téléphone</label>
            <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+33123456789" />
          </div>
          <div className="form-group">
            <label>Préférence de notification</label>
            <p className="form-static-text">Les notifications sont envoyées par e-mail.</p>
          </div>
          {profileMessage.text && <p className={`message ${profileMessage.type}`}>{profileMessage.text}</p>}
          <button type="submit" className="btn-primary">Mettre à jour le profil</button>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="settings-card">
        <h2>Changer le mot de passe</h2>
        <form onSubmit={handlePasswordChange}>
          <div className="form-group">
            <label htmlFor="currentPassword">Mot de passe actuel</label>
            <input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">Nouveau mot de passe</label>
            <input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="confirmNewPassword">Confirmer le nouveau mot de passe</label>
            <input id="confirmNewPassword" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required />
          </div>
          {passwordMessage.text && <p className={`message ${passwordMessage.type}`}>{passwordMessage.text}</p>}
          <button type="submit" className="btn-primary">Changer le mot de passe</button>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
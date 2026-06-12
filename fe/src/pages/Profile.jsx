import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext.jsx';
import toast from 'react-hot-toast';
import Button from '@/components/Button.jsx';
import Input from '@/components/Input.jsx';

const Profile = () => {
  const { user, authFetch, login, loading: authLoading } = useAuth(); // Assuming login updates the user in context
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for profile details
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  useEffect(() => {
    // When the user object is loaded or changes, update the form data.
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  // State for password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await authFetch('http://localhost:4000/api/users/me', {
        method: 'PUT',
        body: JSON.stringify({ name: profileData.name, phone: profileData.phone }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Profile updated successfully!');
        // Update the user in the auth context
        login(data.user, localStorage.getItem('token')); // Re-use login to update context
      } else {
        toast.error(data.error || 'Failed to update profile.'); 
      }
    } catch (err) {
      toast.error('Server connection error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await authFetch('http://localhost:4000/api/users/change-password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      } else {
        toast.error(data.error || 'Failed to change password.');
      }
    } catch (err) {
      toast.error('Server connection error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return <div className="text-center p-12">Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-secondary-900 mb-8">My Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Update Profile Details */}
        <div className="card">
          <h2 className="text-xl font-semibold text-secondary-800 mb-6">Profile Details</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <Input
              label="Full Name"
              name="name"
              type="text"
              value={profileData.name}
              onChange={handleProfileChange}
              required
            />
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={profileData.email}
              disabled
              readOnly
            />
            <Input
              label="Phone Number (Optional)"
              name="phone"
              type="tel"
              value={profileData.phone || ''}
              onChange={handleProfileChange}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </div>

        {/* Change Password */}
        <div className="card">
          <h2 className="text-xl font-semibold text-secondary-800 mb-6">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-6">
            <Input
              label="Current Password"
              name="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              required
            />
            <Input
              label="New Password"
              name="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
            />
            <Input
              label="Confirm New Password"
              name="confirmNewPassword"
              type="password"
              value={passwordData.confirmNewPassword}
              onChange={handlePasswordChange}
              required
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
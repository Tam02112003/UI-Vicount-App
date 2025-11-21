import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/users';
import Input from '../components/UI/Input'; // Assuming Input component is available
import Button from '../components/UI/Button'; // Assuming Button component is available
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { User, UserUpdateRequest, ChangePasswordRequest } from '../types'; // Import ChangePasswordRequest

const schema = yup.object({
  name: yup.string().required('Name is required'),
  avatarUrl: yup.string().url('Invalid URL format').nullable(true),
  currency: yup.string().required('Currency is required'),
});

const passwordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string().min(6, 'New password must be at least 6 characters').required('New password is required'),
  confirmNewPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm new password is required'),
});

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false); // New state

  const { register, handleSubmit, formState: { errors }, reset } = useForm<UserUpdateRequest>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const fetchedProfile = await usersAPI.getProfile();
        setProfile(fetchedProfile);
        reset({
          name: fetchedProfile.name,
          avatarUrl: fetchedProfile.avatarUrl,
          currency: fetchedProfile.currency,
        });
      } catch (err: any) {
        console.error('Failed to fetch profile:', err);
        setError(err.response?.data?.meta?.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [reset]);

  const onSubmit = async (data: UserUpdateRequest) => {
    setApiError(null);
    if (!profile) {
      setApiError('Profile data not loaded');
      return;
    }
    try {
      const updatedUser = await usersAPI.updateProfile(data, profile);
      setProfile(updatedUser);
      updateUser(updatedUser); // Update AuthContext
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setApiError(err.response?.data?.meta?.message || 'Failed to update profile.');
    }
  };

  const handleChangePasswordSuccess = () => {
    setShowChangePasswordModal(false);
    alert('Password changed successfully! Please login again with your new password.');
    // Optionally, force logout here or rely on token expiry for re-authentication
  };

  if (loading) {
    return <div className="text-center mt-8">Loading profile...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-600">Error: {error}</div>;
  }

  if (!profile) {
    return <div className="text-center mt-8 text-gray-600">Profile not found.</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-lg bg-white rounded-lg shadow-md mt-10">
      <h1 className="text-3xl font-bold text-center mb-6">User Profile</h1>
      
      {!isEditing ? (
        <div className="space-y-4">
          <div className="flex justify-center mb-4">
            <img 
              src={profile.avatarUrl || 'https://via.placeholder.com/150'} 
              alt="Avatar" 
              className="w-32 h-32 rounded-full object-cover border-4 border-indigo-200" 
            />
          </div>
          <p className="text-lg"><strong>Name:</strong> {profile.name}</p>
          <p className="text-lg"><strong>Email:</strong> {profile.email}</p>
          <p className="text-lg"><strong>Currency:</strong> {profile.currency}</p>
          <div className="flex justify-end space-x-3">
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            <Button variant="secondary" onClick={() => setShowChangePasswordModal(true)}>Change Password</Button> {/* New button */}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex justify-center mb-4">
            <img 
              src={profile.avatarUrl || 'https://via.placeholder.com/150'} 
              alt="Avatar" 
              className="w-32 h-32 rounded-full object-cover border-4 border-indigo-200" 
            />
          </div>
          <Input 
            label="Name" 
            {...register('name')} 
            error={errors.name?.message} 
          />
          <Input 
            label="Avatar URL" 
            {...register('avatarUrl')} 
            error={errors.avatarUrl?.message} 
            placeholder="e.g., https://example.com/avatar.jpg"
          />
          <Input 
            label="Currency" 
            {...register('currency')} 
            error={errors.currency?.message} 
            placeholder="e.g., USD, VND"
          />
          {apiError && <p className="text-red-600 text-sm text-center">{apiError}</p>}
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <ChangePasswordModal
          isOpen={showChangePasswordModal}
          onClose={() => setShowChangePasswordModal(false)}
          onSuccess={handleChangePasswordSuccess}
        />
      )}
    </div>
  );
};

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ChangePasswordRequest>({
    resolver: yupResolver(passwordSchema),
  });

  const onSubmit = async (data: ChangePasswordRequest) => {
    setApiError(null);
    setLoading(true);
    try {
      await usersAPI.changePassword(data);
      onSuccess();
      reset();
    } catch (err: any) {
      console.error('Error changing password:', err);
      setApiError(err.response?.data?.meta?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 ${isOpen ? '' : 'hidden'}`}>
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-bold mb-4">Change Password</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            {...register('currentPassword')}
            error={errors.currentPassword?.message}
          />
          <Input
            label="New Password"
            type="password"
            {...register('newPassword')}
            error={errors.newPassword?.message}
          />
          <Input
            label="Confirm New Password"
            type="password"
            {...register('confirmNewPassword')}
            error={errors.confirmNewPassword?.message}
          />
          {apiError && <p className="text-red-600 text-sm text-center">{apiError}</p>}
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" loading={loading}>Change Password</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
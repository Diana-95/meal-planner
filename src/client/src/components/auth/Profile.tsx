import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContextProvider';
import { useApi } from '../../context/ApiContextProvider';
import routes from '../../routes/routes';
import { toastInfo, toastError } from '../common/toastService';

const Profile = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const { api, loading } = useApi();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const hasFetchedRef = useRef(false);

  // Load user data on mount
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
      hasFetchedRef.current = true;
    } else if (!hasFetchedRef.current) {
      // Fetch user data if not in context and we haven't fetched yet
      hasFetchedRef.current = true;
      const fetchUser = async () => {
        setIsLoadingUser(true);
        try {
          const currentUser = await api.users.get();
          if (currentUser) {
            setUsername(currentUser.username || '');
            setEmail(currentUser.email || '');
          }
        } catch (error) {
          toastError('Failed to load user data');
          navigate(routes.home);
        } finally {
          setIsLoadingUser(false);
        }
      };
      fetchUser();
    }
  }, [user]);

  const handleUpdate = async () => {
    // Only update fields that have changed
    const updates: { username?: string; email?: string; password?: string; oldPassword?: string } = {};
    
    if (user && username !== user.username) {
      updates.username = username;
    }
    if (user && email !== user.email) {
      updates.email = email;
    }
    if (password && password.trim() !== '') {
      if (password.length < 6) {
        toastError('Password must be at least 6 characters long');
        return;
      }
      // Require old password when changing password
      if (!oldPassword || oldPassword.trim() === '') {
        toastError('Please enter your current password to change it');
        return;
      }
      updates.password = password;
      updates.oldPassword = oldPassword;
    }

    if (Object.keys(updates).length === 0) {
      toastInfo('No changes to save');
      return;
    }

    try {
      await api.users.update(updates.username, updates.email, updates.password, updates.oldPassword);
      
      // Update user context
      if (user) {
        setUser({
          ...user,
          username: updates.username || user.username,
          email: updates.email || user.email,
        });
      }
      
      toastInfo('Profile updated successfully!');
      // Clear password fields and hide password change section
      setPassword('');
      setOldPassword('');
      setShowPassword(false);
      setShowOldPassword(false);
      setShowPasswordChange(false);
    } catch (error) {
      toastError('Failed to update profile');
    }
  };

  const handleCancelPasswordChange = () => {
    setPassword('');
    setOldPassword('');
    setShowPassword(false);
    setShowOldPassword(false);
    setShowPasswordChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleUpdate();
  };

  if ((!user && isLoadingUser) || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }
  
  if (!user && !isLoadingUser) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Edit Profile
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Update your account information
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                minLength={3}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            {!showPasswordChange ? (
              <div>
                <button
                  type="button"
                  onClick={() => setShowPasswordChange(true)}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 border border-primary-300 rounded-md hover:bg-primary-50 transition-colors"
                >
                  Change Password
                </button>
              </div>
            ) : (
              <div className="space-y-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700">Change Password</h3>
                  <button
                    type="button"
                    onClick={handleCancelPasswordChange}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
                
                <div>
                  <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    id="oldPassword"
                    name="oldPassword"
                    type={showOldPassword ? "text" : "password"}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                    placeholder="Enter your current password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                  {oldPassword && (
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="mt-1 text-xs text-gray-500 hover:text-gray-700"
                    >
                      {showOldPassword ? 'Hide' : 'Show'} password
                    </button>
                  )}
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    minLength={6}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                    placeholder="Enter new password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {password && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="mt-1 text-xs text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? 'Hide' : 'Show'} password
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate(routes.home)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 border border-transparent rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;


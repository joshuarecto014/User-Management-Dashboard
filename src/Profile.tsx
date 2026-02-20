import { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  profile_picture?: string | null;
}

function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      const parsed = JSON.parse(saved);
      setUser(parsed);
      setEditName(parsed.name);
      fetchProfile(parsed.id);
    }
  }, []);

  const fetchProfile = async (userId: number) => {
    try {
      const res = await fetch('http://localhost/auth-api/get_profile.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setEditName(data.user.name);
        setProfilePic(data.user.profile_picture);
      }
    } catch (err) {
      setError('Failed to load profile');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePic(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('http://localhost/auth-api/update_profile.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: editName,
          profilePicture: profilePic,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Profile updated!');
        // Update localStorage
        const updatedUser = { ...user, name: editName, profile_picture: profilePic };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else {
        setError(data.message || 'Update failed');
      }
    } catch (err) {
      setError('Server error');
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return 'At least 8 characters';
    if (!/[A-Z]/.test(pwd)) return 'At least one uppercase';
    if (!/[0-9]/.test(pwd)) return 'At least one number';
    return null;
  };

  const handleChangePassword = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    setSuccess('');

    const pwdError = validatePassword(newPassword);
    if (pwdError) {
      setError(pwdError);
      setLoading(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost/auth-api/change_password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          currentPassword,
          newPassword,
          confirmPassword: confirmNewPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Password changed!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        setError(data.message || 'Failed to change password');
      }
    } catch (err) {
      setError('Server error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-blue-600 p-8 text-white text-center">
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <p className="mt-2 opacity-90">Manage your account details</p>
        </div>

        <div className="p-8 space-y-10">
          {/* Profile Picture & Name */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <img
                src={profilePic || 'https://via.placeholder.com/150?text=You'}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 shadow"
              />
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white text-xs px-2 py-1 rounded-full cursor-pointer hover:bg-blue-700">
                Change
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="w-full max-w-sm">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Email (read-only) */}
          <div className="max-w-sm mx-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={user.email}
              readOnly
              className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
            />
          </div>

          <button
            onClick={handleUpdateProfile}
            disabled={loading}
            className="w-full max-w-sm mx-auto block bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-70"
          >
            {loading ? 'Saving...' : 'Save Profile Changes'}
          </button>

          {success && <p className="text-green-600 text-center">{success}</p>}
          {error && <p className="text-red-600 text-center">{error}</p>}

          {/* Change Password Section */}
          <div className="border-t pt-8">
            <h2 className="text-xl font-semibold text-center mb-6">Change Password</h2>

            <div className="space-y-4 max-w-sm mx-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <p className="text-xs text-gray-500">
                Must be at least 8 characters, with 1 uppercase and 1 number.
              </p>

              <button
                onClick={handleChangePassword}
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-70"
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
import { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';  // ← NEW
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

  const logActivity = async (action: string, details: string) => {
  if (!user) return;
  try {
    await fetch('http://localhost/auth-api/log_activity.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        user_name: user.name,
        action,
        details
      }),
    });
  } catch (err) {
    console.log('Failed to log activity');
  }

};

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

const MAX_FILE_SIZE = 500 * 1024; // 500 KB (you can increase to 800 KB later)

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (file.size > MAX_FILE_SIZE) {
    setError(`File too large! Maximum allowed is ${ (MAX_FILE_SIZE / 1024).toFixed(0) } KB. Try a smaller image.`);
    e.target.value = ''; // clear the input
    return;
  }

  if (!file.type.startsWith('image/')) {
    setError('Only image files are allowed (jpg, png, gif, etc.)');
    e.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onloadend = () => {
    setProfilePic(reader.result as string);
    setError(''); // clear previous errors
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
        logActivity('PROFILE_UPDATE', `Updated name and/or profile picture`);
        // Update localStorage
        const updatedUser = { ...user, name: editName, profile_picture: profilePic };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else {
        setError(data.message || 'Update failed');
      }
    } catch (err: any) {
        console.error('Update profile error:', err);
        if (err.message?.includes('413') || err.message?.includes('Payload Too Large')) {
          setError('Image is too large for the server. Try a file under 300 KB.');
        } else if (err.message?.includes('CORS')) {
          setError('Connection issue – check if XAMPP is running and CORS is allowed.');
        } else {
          setError('Failed to save profile. Please try again.');
        }
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
        logActivity('PASSWORD_CHANGE', 'User changed their password');
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
                src={profilePic || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjE1MCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNFNUU3RUIiLz48dGV4dCB4PSI1MCIgeT0iNzUiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5Q0EzQjMiPk15IEF2YXRhcjwvdGV4dD48L3N2Zz4='}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 shadow"
              />
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white text-xs px-3 py-1 rounded-full cursor-pointer hover:bg-blue-700 shadow">
                Change Photo
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Size guidance – always visible */}
            <p className="text-xs text-gray-500 text-center">
              Recommended: square image, max 500 KB (small photos work best)
            </p>

            {error && error.includes('File too large') && (
              <p className="text-red-600 text-sm">{error}</p>
            )}
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
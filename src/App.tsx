
import { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
  Outlet,
} from 'react-router-dom';
import Profile from './Profile';
import AdminDashboard from './AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import UserDashboard from './UserDashboard';
import { useAuth } from './contexts/AuthContext';


interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';     // ← add this line
  profile_picture?: string | null;  // optional, good to have if used elsewhere
}

interface FormData {
  name?: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return 'Password must be at least 8 characters long';
    if (!/[A-Z]/.test(pwd)) return 'At least one uppercase letter';
    if (!/[0-9]/.test(pwd)) return 'At least one number';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    if (!isLogin) {
      const pwdError = validatePassword(formData.password || '');
      if (pwdError) {
        setError(pwdError);
        setLoading(false);
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
    }

    const url = isLogin
      ? 'http://localhost/auth-api/login.php'
      : 'http://localhost/auth-api/register.php';

    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : { name: formData.name, email: formData.email, password: formData.password };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log('API Response:', data);

      if (data.success) {
        if (isLogin) {
          const userData = data.user;
          console.log('Saving user to localStorage:', userData);
          localStorage.setItem('user', JSON.stringify(userData));

          // ====================== AUTO LOG LOGIN ======================
            if (userData.role === 'user') {
              try {
              await fetch('http://localhost/auth-api/log_activity.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  user_id: userData.id,
                  user_name: userData.name,
                  action: 'LOGIN',
                  details: 'User logged in successfully'
                }),
              });
              console.log('User login activity logged');
            } catch (err) {
              console.log('Failed to log login activity');
            }
          }
          // ============================================================

          // Smart redirect
          if (userData.role === 'admin') {
            navigate('/admin', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        } else {
          setSuccessMsg('Registration successful! Please sign in.');
          setIsLogin(true);
          setFormData({ email: formData.email, password: '', confirmPassword: '' });
        }
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch (err) {
      setError('Cannot connect to server. Is XAMPP running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          {isLogin ? 'Sign In' : 'Create Account'}
        </h1>
        <p className="text-center text-gray-500 mb-8">Secure Auth System</p>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        {successMsg && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* same form fields as before – name, email, password, confirm */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="text-xs text-gray-500">
                At least 8 characters, 1 uppercase, 1 number
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-70"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccessMsg('');
            }}
            className="text-blue-600 font-medium hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}

function ProtectedLayout() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCurrentUser(parsed);
        console.log("User loaded in ProtectedLayout:", parsed);
      } catch (e) {
        console.error("Bad user JSON", e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600 animate-pulse">
          Loading user... (or redirecting)
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white p-4 shadow">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link 
            to={currentUser?.role === 'admin' ? "/admin" : "/dashboard"} 
            className="text-xl font-bold hover:underline"
          >
            Dashboard
          </Link>

          <div className="flex items-center space-x-6">
            <Link 
              to="/profile" 
              className="hover:underline cursor-pointer font-medium"
            >
              {currentUser?.name ?? 'User'}
            </Link>
            
            {currentUser?.role === 'admin' && (
              <Link to="/admin" className="hover:underline">
                Admin Panel
              </Link>
            )}
            
            <button
              onClick={handleLogout}
              className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="p-8 max-w-6xl mx-auto">
        <Outlet />
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AuthPage />} />

        {/* Protected Layout for all logged-in users */}
        <Route element={<ProtectedLayout />}>
          <Route path="/profile" element={<Profile />} />
          
          {/* User Dashboard */}
          <Route path="/dashboard" element={<UserDashboard />} />
          
          {/* Admin-only routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
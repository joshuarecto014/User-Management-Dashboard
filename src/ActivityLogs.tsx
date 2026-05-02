import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';

interface ActivityLog {
  id: number;
  user_name: string;
  action: string;
  details: string | null;
  created_at: string;
  email?: string;
}

function ActivityLogs() {
  const { currentUser } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchLogs();
    } else if (currentUser) {
      setError("Access denied: Admin only");
      setLoading(false);
    }
  }, [currentUser]);

  const fetchLogs = async () => {
    if (!currentUser || currentUser.role !== 'admin') return;

    try {
      setLoading(true);
      setError('');

      const res = await fetch('http://localhost/auth-api/get_logs.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id }),
      });

      const data = await res.json();

      if (data.success) {
        setLogs(data.logs || []);
      } else {
        setError(data.message || 'Failed to load logs');
      }
    } catch (err) {
      setError('Cannot connect to server');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading activity logs...</div>;
  if (error) return <div className="p-8 text-red-600 text-center">{error}</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Activity Logs</h1>
        <button 
          onClick={fetchLogs}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left">Time</th>
              <th className="px-6 py-4 text-left">User</th>
              <th className="px-6 py-4 text-left">Action</th>
              <th className="px-6 py-4 text-left">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="px-6 py-4 font-medium">{log.user_name}</td>
                <td className="px-6 py-4">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{log.details || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {logs.length === 0 && (
          <div className="p-12 text-center text-gray-500">No activity logs yet.</div>
        )}
      </div>
    </div>
  );
}

export default ActivityLogs;
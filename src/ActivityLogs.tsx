import { useState, useEffect } from 'react';

interface ActivityLog {
  id: number;
  user_name: string;
  action: string;
  details: string | null;
  created_at: string;
  email?: string;
}

function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Load user from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      const user = JSON.parse(saved);
      setCurrentUser(user);
    } else {
      setError("Please log in");
      setLoading(false);
    }
  }, []);

  // Fetch logs when user is loaded
  useEffect(() => {
    if (currentUser) {
      fetchLogs();
    }
  }, [currentUser]);

  const fetchLogs = async () => {
    if (!currentUser || currentUser.role !== 'admin') {
      setError("Access denied: Admin only");
      setLoading(false);
      return;
    }

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
      console.error(err);
      setError('Cannot connect to server');
    } finally {
      setLoading(false);
    }
  };

  // ====================== EXPORT TO CSV ======================
  const exportToCSV = () => {
    if (logs.length === 0) {
      alert("No logs to export!");
      return;
    }

    const headers = ['Time', 'User', 'Email', 'Action', 'Details'];
    
    const rows = logs.map(log => [
      new Date(log.created_at).toLocaleString(),
      log.user_name,
      log.email || '',
      log.action,
      log.details || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.href = url;
    link.download = `activity_logs_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    
    URL.revokeObjectURL(url);
  };
  // ==========================================================

  if (loading) return <div className="p-8 text-center">Loading activity logs...</div>;
  
  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Activity Logs</h1>
        
        <div className="flex gap-3">
          <button 
            onClick={fetchLogs}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Refresh
          </button>
          
          <button 
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
             Export CSV
          </button>
        </div>
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
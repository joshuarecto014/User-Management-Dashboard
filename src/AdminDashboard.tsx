function AdminDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-red-600 mb-6">Admin Dashboard</h1>
      <p className="text-xl mb-4">Welcome, Admin! Only you can see this page.</p>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Admin Features (coming soon)</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>User management (list, suspend, delete)</li>
          <li>View all activity logs</li>
          <li>Role assignment</li>
          <li>Stats & charts</li>
        </ul>
      </div>
      
      <p className="mt-6 text-gray-600">
        Backend is enforcing: non-admins get "Access denied" on admin APIs.
      </p>
    </div>
  );
}

export default AdminDashboard;
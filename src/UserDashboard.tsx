function UserDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-blue-600 mb-6">Welcome to Your Dashboard</h1>
      <p className="text-xl mb-8 text-gray-600">Hello, {JSON.parse(localStorage.getItem('user') || '{}').name || 'User'}!</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Stats Cards */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700">Account Status</h3>
          <p className="text-3xl font-bold text-green-600 mt-4">Active</p>
          <p className="text-sm text-gray-500 mt-1">Your account is in good standing</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700">Last Login</h3>
          <p className="text-3xl font-bold text-gray-800 mt-4">Just now</p>
          <p className="text-sm text-gray-500 mt-1">Today</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700">Profile Completion</h3>
          <p className="text-3xl font-bold text-amber-600 mt-4">85%</p>
          <p className="text-sm text-gray-500 mt-1">Complete your profile</p>
        </div>
      </div>

      <div className="mt-10 bg-white p-6 rounded-xl shadow border border-gray-200">
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a 
            href="/profile" 
            className="block p-6 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition"
          >
            <h3 className="font-medium text-lg">Edit Profile</h3>
            <p className="text-gray-600 mt-1">Update your name, photo, or password</p>
          </a>
          
          <div className="block p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-medium text-lg text-gray-400">Activity Log</h3>
            <p className="text-gray-500 mt-1">Coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
import { useState } from 'react';
import ActivityLogs from './ActivityLogs';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'logs'>('overview');

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-red-600">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {currentUser.name}</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b mb-8">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 font-medium transition ${
            activeTab === 'overview' 
              ? 'border-b-4 border-red-600 text-red-600' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-6 py-3 font-medium transition ${
            activeTab === 'logs' 
              ? 'border-b-4 border-red-600 text-red-600' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Activity Logs
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-2xl shadow">
              <h3 className="text-2xl font-semibold mb-6">System Overview</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-gray-500">Total Users</p>
                  <p className="text-5xl font-bold text-gray-800">24</p>
                </div>
                <div>
                  <p className="text-gray-500">Active Sessions</p>
                  <p className="text-5xl font-bold text-green-600">12</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow">
              <h3 className="text-2xl font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full py-4 bg-gray-100 hover:bg-gray-200 rounded-xl text-left px-6 font-medium transition">
                  Manage All Users
                </button>
                <button className="w-full py-4 bg-gray-100 hover:bg-gray-200 rounded-xl text-left px-6 font-medium transition">
                  View Reports
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Logs Tab */}
      {activeTab === 'logs' && <ActivityLogs />}
    </div>
  );
}

export default AdminDashboard;
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '@qrseva/firebase-config';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const { user, role } = useAuth();
    const navigate = useNavigate();
    const auth = getAuth(app);

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Sales Dashboard</h1>
                <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded">Logout</button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-2">My Profile</h3>
                    <p>Email: {user?.email}</p>
                    <p>Role: {role}</p>
                </div>
                {/* Placeholder stats */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-2">Total Restaurants</h3>
                    <p className="text-4xl font-bold">0</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-2">Active Subscriptions</h3>
                    <p className="text-4xl font-bold">0</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
                <div className="flex space-x-4">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => navigate('/restaurants/new')}>Onboard Restaurant</button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={() => navigate('/restaurants')}>View Restaurants</button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

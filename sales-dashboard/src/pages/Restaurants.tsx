import { useState } from 'react';
// import { getFunctions, httpsCallable } from 'firebase/functions';
// import { app } from '@qrseva/firebase-config';
import { useNavigate } from 'react-router-dom';

interface Restaurant {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    currentPlan: string | null;
}

const Restaurants: React.FC = () => {
    const [restaurants] = useState<Restaurant[]>([]);
    // const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    // const [loading, setLoading] = useState(true);
    const loading = false;
    const navigate = useNavigate();
    // const functions = getFunctions(app);

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Restaurants</h1>
                <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-gray-600 text-white rounded">Back to Dashboard</button>
            </header>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Plan
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-4">Loading...</td></tr>
                        ) : restaurants.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-4">No restaurants found.</td></tr>
                        ) : (
                            restaurants.map(r => (
                                <tr key={r.id}>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{r.name}</td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{r.email}</td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${r.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {r.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{r.currentPlan || 'N/A'}</td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <button className="text-blue-600 hover:text-blue-900">Manage</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Restaurants;

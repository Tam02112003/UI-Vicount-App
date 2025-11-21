import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { groupsAPI } from '../services/groups';
import GroupCard from '../components/GroupCard'; // Assume you have this component
import type { Group } from '../types';

const HomePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await groupsAPI.getAll();
        setGroups(response); // groupsAPI.getAll now returns the data directly
      } catch (err: any) {
        console.error('Failed to fetch groups:', err);
        setError(err.response?.data?.meta?.message || 'Failed to load groups.');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  if (loading) {
    return <div className="text-center mt-8">Loading groups...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Groups</h1>
        <div>
          {user ? (
            <span className="mr-4 text-gray-700">Welcome, {user.email}!</span>
          ) : (
            <span className="mr-4 text-gray-700">Not logged in</span>
          )}
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="mb-6">
        <Link
          to="/groups/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
        >
          Create New Group
        </Link>
      </div>

      {groups.length === 0 ? (
        <p className="text-gray-600">No groups found. Create one to get started!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <GroupCard
              key={group._id}
              id={group._id}
              name={group.name}
              description={group.description}
              memberCount={group.memberIds ? group.memberIds.length : 0}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
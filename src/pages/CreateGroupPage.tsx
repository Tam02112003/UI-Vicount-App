import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // To get current user ID
import { groupsAPI } from '../services/groups';

const schema = yup.object().shape({
  name: yup.string().required('Group name is required'),
  description: yup.string().nullable(true),
});

const CreateGroupPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get the current authenticated user
  const [apiError, setApiError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: yup.InferType<typeof schema>) => {
    setApiError(null);
    if (!user || !user._id) {
      setApiError('User not authenticated. Please log in.');
      return;
    }

    try {
      const group = await groupsAPI.create({
        name: data.name,
        description: data.description || '',
        memberIds: [user._id], // Add current user as initial member
      });
      navigate(`/groups/${group._id}`); // Navigate to the new group's detail page
    } catch (error: any) {
      console.error('Create group error:', error);
      setApiError(error.response?.data?.meta?.message || error.message || 'Failed to create group.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create New Group
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">Group Name</label>
              <input
                id="name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Group Name"
                {...register('name')}
              />
              {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="description" className="sr-only">Description</label>
              <textarea
                id="description"
                rows={3}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Description (Optional)"
                {...register('description')}
              />
              {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description.message}</p>}
            </div>
          </div>

          {apiError && <p className="mt-2 text-sm text-red-600 text-center">{apiError}</p>}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Group
            </button>
          </div>
        </form>
        <div className="text-sm text-center mt-4">
          <Link to="/" className="font-medium text-indigo-600 hover:text-indigo-500">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupPage;

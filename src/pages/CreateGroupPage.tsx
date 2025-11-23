import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { groupsAPI } from '../services/groups';
import { useToast } from '../context/ToastContext'; // Import useToast

const schema = yup.object().shape({
  name: yup.string().required('Group name is required'),
  description: yup.string().nullable(true),
});

const CreateGroupPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>(); // Get ID from URL for edit mode
  const isEditing = !!id; // Determine if we are in edit mode
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEditing); // Set loading true if editing
  const [groupMembers, setGroupMembers] = useState<string[]>([]); // New state for group members
  const { addToast } = useToast();

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      description: '',
    }
  });

  useEffect(() => {
    if (isEditing) {
      const fetchGroup = async () => {
        try {
          const fetchedGroup = await groupsAPI.getById(id!);
          reset({
            name: fetchedGroup.name,
            description: fetchedGroup.description,
          });
          setGroupMembers(fetchedGroup.memberIds); // Set the fetched member IDs
        } catch (error: any) {
          console.error('Failed to fetch group for editing:', error);
          setApiError(error.response?.data?.meta?.message || error.message || 'Failed to load group for editing.');
          addToast('error', 'Failed to load group for editing.');
          navigate('/groups'); // Redirect if group not found or error
        } finally {
          setLoading(false);
        }
      };
      fetchGroup();
    }
  }, [id, isEditing, reset, navigate, addToast]);

  const onSubmit = async (data: yup.InferType<typeof schema>) => {
    setApiError(null);
    if (!user || !user._id) {
      setApiError('User not authenticated. Please log in.');
      addToast('error', 'User not authenticated. Please log in.');
      return;
    }

    try {
      if (isEditing) {
        // Update existing group
        await groupsAPI.update(id!, {
          name: data.name,
          description: data.description || '',
          memberIds: groupMembers, // Use the fetched member IDs
        });
        addToast('success', 'Group updated successfully!');
        navigate(`/groups/${id}`); // Navigate back to the group's detail page
      } else {
        // Create new group
        const group = await groupsAPI.create({
          name: data.name,
          description: data.description || '',
          memberIds: [user._id], // Add current user as initial member
        });
        addToast('success', 'Group created successfully!');
        navigate(`/groups/${group._id}`); // Navigate to the new group's detail page
      }
    } catch (error: any) {
      console.error(isEditing ? 'Update group error:' : 'Create group error:', error);
      const errorMessage = error.response?.data?.meta?.message || error.message || (isEditing ? 'Failed to update group.' : 'Failed to create group.');
      setApiError(errorMessage);
      addToast('error', errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isEditing ? 'Edit Group' : 'Create New Group'}
          </h2>
        </div>
        {loading ? (
          <div className="text-center text-gray-600">Loading group details...</div>
        ) : (
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
                {isEditing ? 'Save Changes' : 'Create Group'}
              </button>
            </div>
          </form>
        )}
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

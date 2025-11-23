import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SimplifiedUser } from '../types';

interface CreateExpensePageProps {
  groupId: string;
  participants: SimplifiedUser[]; // List of member objects
  onSuccess: () => void;
  onCancel: () => void;
}

// Define the validation schema using yup
const schema = yup.object().shape({
  description: yup.string().required('Description is required'),
  amount: yup.number().typeError('Amount must be a number').positive('Amount must be positive').required('Amount is required'),
  currency: yup.string().required('Currency is required'),
  payerId: yup.string().required('Payer is required'),
  participantIds: yup.array().of(yup.string()).min(1, 'At least one participant is required').required('Participants are required'),
  date: yup.string().required('Date is required'),
  // Backend requires category not blank; enforce here to avoid 400 from backend
  category: yup.string().required('Category is required'),
});

const CreateExpensePage: React.FC<CreateExpensePageProps> = ({ groupId, participants, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const effectiveParticipants = participants && participants.length > 0 ? participants : [];

  const defaultValues = {
    description: '',
    amount: 0,
    currency: user?.currency || 'USD', // Default to user's currency or USD
    payerId: user?._id || (effectiveParticipants.length > 0 ? effectiveParticipants[0]?.id : ''), // Fallback to first participant
    participantIds: effectiveParticipants.map(p => p.id), // Default all group members as participants
    date: new Date().toISOString().split('T')[0], // Default to today's date (YYYY-MM-DD)
    category: 'Other',
  };

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const onSubmit = async (data: yup.InferType<typeof schema>) => {
    setApiError(null);
    try {
      // Ensure participants is an array of strings
      const participantsPayload = Array.isArray((data as any).participantIds)
        ? (data as any).participantIds
        : [(data as any).participantIds];

      // Convert date (YYYY-MM-DD) to ISO instant (start of day UTC)
      // Create a Date from the local date string and convert to ISO
      const isoDate = new Date((data as any).date + 'T00:00:00Z').toISOString();

      await api.post('/expenses', {
        groupId: groupId,
        description: data.description,
        amount: data.amount,
        currency: data.currency,
        payerId: data.payerId,
        participants: participantsPayload, // Backend expects 'participants'
        date: isoDate,
        category: data.category,
      });
      onSuccess(); // Call success callback
    } catch (error: any) {
      console.error('Create expense error:', error);
      // Backend ResponseMeta.meta can be an array of MetaMessage objects
      const meta = error?.response?.data?.meta;
      if (Array.isArray(meta)) {
        const messages = meta.map((m: any) => m?.message || JSON.stringify(m)).join('; ');
        setApiError(messages || 'Failed to create expense.');
      } else {
        setApiError(error.response?.data?.meta?.message || error.message || 'Failed to create expense.');
      }
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <input
            id="description"
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            {...register('description')}
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
          <input
            id="amount"
            type="number"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            {...register('amount')}
          />
          {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>}
        </div>

        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700">Currency</label>
          <input
            id="currency"
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            {...register('currency')}
          />
          {errors.currency && <p className="mt-1 text-sm text-red-600">{errors.currency.message}</p>}
        </div>

        <div>
          <label htmlFor="payerId" className="block text-sm font-medium text-gray-700">Payer</label>
          <select
            id="payerId"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            {...register('payerId')}
          >
            {effectiveParticipants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.email})
              </option>
            ))}
          </select>
          {errors.payerId && <p className="mt-1 text-sm text-red-600">{errors.payerId.message}</p>}
        </div>

        <div>
          <label htmlFor="participantIds" className="block text-sm font-medium text-gray-700">Participants</label>
          <select
            id="participantIds"
            multiple
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            {...register('participantIds')}
          >
            {effectiveParticipants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.email})
              </option>
            ))}
          </select>
          {errors.participantIds && <p className="mt-1 text-sm text-red-600">{errors.participantIds.message}</p>}
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
          <input
            id="date"
            type="date"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            {...register('date')}
          />
          {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
          <input
            id="category"
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            {...register('category')}
          />
          {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
        </div>

        {apiError && <p className="mt-2 text-sm text-red-600 text-center">{apiError}</p>}

        <div className="flex justify-end space-x-2 mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Expense
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateExpensePage;
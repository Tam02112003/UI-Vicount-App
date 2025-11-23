import React from 'react';
import { ExpenseResponseDTO } from '../types';

interface ExpenseCardProps {
  expense: ExpenseResponseDTO;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({
  expense,
  onEdit,
  onDelete,
}) => {
  const { id, description, amount, currency, payer, participantsDetails, date } = expense;

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold">{description}</h3>
      <p className="text-gray-700">
        Amount: {amount} {currency}
      </p>
      <p className="text-gray-600 text-sm">Paid by: {payer.name}</p>
      <p className="text-gray-600 text-sm">Participants: {participantsDetails.length}</p>
      <p className="text-gray-600 text-sm">Date: {new Date(date).toLocaleDateString()}</p>

      <div className="mt-4 flex space-x-2">
        <button
          onClick={() => onEdit(id)}
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(id)}
          className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ExpenseCard;

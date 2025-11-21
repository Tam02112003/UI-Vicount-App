import React from 'react';

interface DebtCardProps {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
  onMarkPaid: (debtId: string, amount: number, method: string) => void;
  // Optional: show a simplified flag
  isSimplified?: boolean;
}

const DebtCard: React.FC<DebtCardProps> = ({
  id,
  fromUserId,
  toUserId,
  amount,
  currency,
  onMarkPaid,
  isSimplified = false,
}) => {
  // Simple prompt for payment method for now
  const handleMarkPaid = () => {
    const paymentMethod = prompt('Enter payment method (e.g., Cash, Bank Transfer):');
    if (paymentMethod) {
      onMarkPaid(id, amount, paymentMethod);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold">
        {fromUserId} owes {toUserId}
      </h3>
      <p className="text-gray-700">
        Amount: {amount} {currency}
      </p>
      {isSimplified && <span className="text-xs text-indigo-600">Simplified Debt</span>}
      <div className="mt-4 flex space-x-2">
        <button
          onClick={handleMarkPaid}
          className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded"
        >
          Mark as Paid
        </button>
      </div>
    </div>
  );
};

export default DebtCard;

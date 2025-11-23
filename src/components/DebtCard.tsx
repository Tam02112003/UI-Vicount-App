import React from 'react';

interface DebtCardProps {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUserName: string;
  toUserName: string;
  amount: number;
  currency: string;
  onOpenPayDebtModal: () => void;
  isSimplified?: boolean;
}

const DebtCard: React.FC<DebtCardProps> = ({
  id,
  fromUserId,
  toUserId,
  fromUserName,
  toUserName,
  amount,
  currency,
  onOpenPayDebtModal,
  isSimplified = false,
}) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold">
        {fromUserName} owes {toUserName}
      </h3>
      <p className="text-gray-700">
        Amount: {amount} {currency}
      </p>
      {isSimplified && <span className="text-xs text-indigo-600">Simplified Debt</span>}
      <div className="mt-4 flex space-x-2">
        <button
          onClick={onOpenPayDebtModal}
          className={`bg-green-500 text-white text-sm px-3 py-1 rounded ${
            isSimplified
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-green-600'
          }`}
          disabled={isSimplified}
          title={
            isSimplified
              ? 'You can only pay actual (non-simplified) debts.'
              : 'Mark this debt as paid'
          }
        >
          Mark as Paid
        </button>
      </div>
    </div>
  );
};

export default DebtCard;

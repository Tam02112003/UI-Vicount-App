import React from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Receipt, Users } from 'lucide-react';
import type { Expense } from '../../types';

interface ExpenseCardProps {
  expense: Expense;
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense }) => {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency === 'VND' ? 'VND' : 'USD',
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Receipt className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              {expense.description}
            </h3>
            <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
              <span className="bg-gray-100 px-2 py-1 rounded-full">
                {expense.category}
              </span>
              <span>
                {format(new Date(expense.date), 'dd/MM/yyyy', { locale: vi })}
              </span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Users className="h-3 w-3" />
              <span>{expense.participants.length} người tham gia</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">
            {formatCurrency(expense.amount, expense.currency)}
          </div>
          <div className="text-xs text-gray-500">
            Trả bởi {expense.payer?.name || 'Unknown'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseCard;
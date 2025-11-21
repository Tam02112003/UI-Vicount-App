import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import Button from '../UI/Button';
import { debtsAPI } from '../../services/debts';
import type { Debt } from '../../types';

interface DebtCardProps {
  debt: Debt;
  onPaid: () => void;
}

const DebtCard: React.FC<DebtCardProps> = ({ debt, onPaid }) => {
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency === 'VND' ? 'VND' : 'USD',
    }).format(amount);
  };

  const handleMarkPaid = async () => {
    setLoading(true);
    try {
      await debtsAPI.markPaid(debt._id);
      onPaid();
    } catch (error) {
      console.error('Error marking debt as paid:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${debt.isPaid ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="text-sm font-medium text-gray-900">
              {debt.fromUser?.name || 'Unknown'}
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className="text-sm font-medium text-gray-900">
              {debt.toUser?.name || 'Unknown'}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className={`text-lg font-bold ${debt.isPaid ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(debt.amount, debt.currency)}
            </div>
            {debt.isPaid && (
              <div className="flex items-center text-xs text-green-600">
                <Check className="h-3 w-3 mr-1" />
                Đã thanh toán
              </div>
            )}
          </div>
          
          {!debt.isPaid && (
            <Button
              size="sm"
              onClick={handleMarkPaid}
              loading={loading}
            >
              Đánh dấu đã trả
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebtCard;
import React, { useState, useEffect } from 'react';
import Modal from '../UI/Modal'; // Assuming a generic Modal component exists
import Input from '../UI/Input'; // Assuming a generic Input component
import Button from '../UI/Button'; // Assuming a generic Button component

interface PayDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPay: (amount: number, method: string) => void;
  debtAmount: number;
  debtCurrency: string;
}

const PayDebtModal: React.FC<PayDebtModalProps> = ({
  isOpen,
  onClose,
  onPay,
  debtAmount,
  debtCurrency,
}) => {
  const [amount, setAmount] = useState(debtAmount);
  const [method, setMethod] = useState('');
  const [error, setError] = useState('');

  // Reset state when modal is opened for a new debt
  useEffect(() => {
    if (isOpen) {
      setAmount(debtAmount);
      setMethod('');
      setError('');
    }
  }, [isOpen, debtAmount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || amount > debtAmount) {
      setError(`Amount must be between 0.01 and ${debtAmount}.`);
      return;
    }
    if (!method.trim()) {
      setError('Payment method is required.');
      return;
    }
    onPay(amount, method);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mark Debt as Paid">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount to Pay
          </label>
          <Input
            type="number"
            id="amount"
            value={String(amount)}
            onChange={(e) => setAmount(Number(e.target.value))}
            step="0.01"
            max={debtAmount}
            min="0.01"
            required
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">
            Total debt: {debtAmount} {debtCurrency}
          </p>
        </div>
        <div>
          <label htmlFor="method" className="block text-sm font-medium text-gray-700">
            Payment Method
          </label>
          <Input
            type="text"
            id="method"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            placeholder="e.g., Cash, Bank Transfer"
            required
            className="mt-1"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button type="submit">
            Confirm Payment
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PayDebtModal;

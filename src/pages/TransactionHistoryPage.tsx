import React, { useState, useEffect } from 'react';
import { transactionsAPI } from '../services/transactions';
import { useAuth } from '../context/AuthContext';
import type { TransactionLog } from '../types';

const TransactionHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [transactionLogs, setTransactionLogs] = useState<TransactionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactionLogs = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const fetchedLogs = await transactionsAPI.getUserTransactionLogs();
      // Sort logs by createdAt, newest first
      setTransactionLogs(fetchedLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err: any) {
      console.error('Failed to fetch transaction logs:', err);
      setError(err.response?.data?.meta?.message || 'Failed to load transaction history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactionLogs();
  }, [user]);

  if (loading) {
    return <div className="text-center mt-8">Loading transaction history...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl mt-10">
      <h1 className="text-3xl font-bold text-center mb-6">Transaction History</h1>
      
      {transactionLogs.length === 0 ? (
        <p className="text-center text-gray-600">No transactions yet.</p>
      ) : (
        <div className="space-y-4">
          {transactionLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-lg shadow-sm border border-gray-200 bg-white"
            >
              <p className="font-medium text-gray-900">{log.description}</p>
              {log.amount && log.currency && (
                <p className="text-sm text-gray-700">Amount: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: log.currency === 'VND' ? 'VND' : 'USD' }).format(log.amount)}</p>
              )}
              <p className="text-xs text-gray-500">Type: {log.type}</p>
              <p className="text-xs text-gray-500">Date: {new Date(log.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionHistoryPage;
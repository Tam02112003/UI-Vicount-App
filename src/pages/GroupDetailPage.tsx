import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Users, Receipt, CreditCard } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import Button from '../components/UI/Button';
import ExpenseCard from '../components/Expenses/ExpenseCard';
import DebtCard from '../components/Debts/DebtCard';
import CreateExpenseModal from '../components/Expenses/CreateExpenseModal';
import { groupsAPI, expensesAPI, debtsAPI, usersAPI } from '../services/api';
import type { Group, Expense, Debt, User } from '../types';

const GroupDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateExpenseModal, setShowCreateExpenseModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'expenses' | 'debts'>('expenses');

  useEffect(() => {
    if (id) {
      loadGroupData();
    }
  }, [id]);

  const loadGroupData = async () => {
    if (!id) return;

    try {
      const [groupData, expensesData, debtsData] = await Promise.all([
        groupsAPI.getById(id),
        expensesAPI.getByGroup(id),
        debtsAPI.getByGroup(id),
      ]);

      setGroup(groupData);
      setExpenses(expensesData);
      setDebts(debtsData);

      // Load member details
      const memberPromises = groupData.memberIds.map(memberId => 
        usersAPI.getById(memberId)
      );
      const membersData = await Promise.all(memberPromises);
      setMembers(membersData);
    } catch (error) {
      console.error('Error loading group data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseCreated = () => {
    loadGroupData();
  };

  const handleDebtPaid = () => {
    loadGroupData();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  if (!group) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Không tìm thấy nhóm</h2>
        </div>
      </Layout>
    );
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const unpaidDebts = debts.filter(debt => !debt.isPaid);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Group Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {group.name}
              </h1>
              <p className="text-gray-600 mb-4">{group.description}</p>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{members.length} thành viên</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Receipt className="h-4 w-4" />
                  <span>{expenses.length} chi tiêu</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CreditCard className="h-4 w-4" />
                  <span>
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(totalExpenses)}
                  </span>
                </div>
              </div>
            </div>
            <Button onClick={() => setShowCreateExpenseModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm chi tiêu
            </Button>
          </div>
        </div>

        {/* Members */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Thành viên</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <div key={member._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-medium">
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {member.name}
                  </div>
                  <div className="text-xs text-gray-500">{member.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('expenses')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'expenses'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Chi tiêu ({expenses.length})
              </button>
              <button
                onClick={() => setActiveTab('debts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'debts'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Công nợ ({unpaidDebts.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'expenses' && (
              <div className="space-y-4">
                {expenses.length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Chưa có chi tiêu nào
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Thêm chi tiêu đầu tiên cho nhóm này
                    </p>
                    <Button onClick={() => setShowCreateExpenseModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm chi tiêu
                    </Button>
                  </div>
                ) : (
                  expenses.map((expense) => (
                    <ExpenseCard key={expense._id} expense={expense} />
                  ))
                )}
              </div>
            )}

            {activeTab === 'debts' && (
              <div className="space-y-4">
                {debts.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Không có công nợ
                    </h3>
                    <p className="text-gray-500">
                      Tất cả các khoản đã được thanh toán
                    </p>
                  </div>
                ) : (
                  debts.map((debt) => (
                    <DebtCard key={debt._id} debt={debt} onPaid={handleDebtPaid} />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateExpenseModal
        isOpen={showCreateExpenseModal}
        onClose={() => setShowCreateExpenseModal(false)}
        onSuccess={handleExpenseCreated}
        groupId={group._id}
        members={members}
      />
    </Layout>
  );
};

export default GroupDetailPage;
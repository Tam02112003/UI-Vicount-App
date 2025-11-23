import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { groupsAPI } from '../services/groups';
import { expensesAPI } from '../services/expenses';
import { debtsAPI } from '../services/debts';
import { usersAPI } from '../services/users';
import { invitesAPI } from '../services/invites';
import { useAuth } from '../context/AuthContext';
import ExpenseCard from '../components/ExpenseCard';
import CreateExpensePage from './CreateExpensePage';
import DebtCard from '../components/DebtCard';
import PayDebtModal from '../components/Debts/PayDebtModal';
import type { InviteResponseDTO, Group, ExpenseResponseDTO, DebtResponseDTO } from '../types';

import EditExpenseModal from '../components/Expenses/EditExpenseModal';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

const GroupDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'expenses' | 'debts' | 'members' | 'invites'>('expenses');

  const [expenses, setExpenses] = useState<ExpenseResponseDTO[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState<boolean>(true);
  const [expenseError, setExpenseError] = useState<string | null>(null);
  const [showCreateExpenseModal, setShowCreateExpenseModal] = useState<boolean>(false);
  const [showEditExpenseModal, setShowEditExpenseModal] = useState<boolean>(false);
  const [expenseToEdit, setExpenseToEdit] = useState<ExpenseResponseDTO | null>(null);

  const [simplifiedDebts, setSimplifiedDebts] = useState<DebtResponseDTO[]>([]);
  const [allDebts, setAllDebts] = useState<DebtResponseDTO[]>([]);
  const [loadingDebts, setLoadingDebts] = useState<boolean>(true);
  const [debtError, setDebtError] = useState<string | null>(null);
  const [showAllDebts, setShowAllDebts] = useState<boolean>(false);
  
  const [isPayDebtModalOpen, setIsPayDebtModalOpen] = useState(false);
  const [debtToPay, setDebtToPay] = useState<DebtResponseDTO | null>(null);

  const [membersData, setMembersData] = useState<UserProfile[]>([]);
  const [loadingMembers, setLoadingMembers] = useState<boolean>(true);
  const [memberError, setMemberError] = useState<string | null>(null);

  const [sentInvites, setSentInvites] = useState<InviteResponseDTO[]>([]);
  const [loadingInvites, setLoadingInvites] = useState<boolean>(true);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [showSendInviteModal, setShowSendInviteModal] = useState<boolean>(false);
  const [showEditGroupModal, setShowEditGroupModal] = useState<boolean>(false);


  const fetchGroupDetails = async () => {
    if (!id) return;
    try {
      const response = await groupsAPI.getById(id);
      setGroup(response);
    } catch (err: any) {
      console.error('Failed to fetch group details:', err);
      setError(err.response?.data?.meta?.message || 'Failed to load group details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    if (!id) return;
    setLoadingExpenses(true);
    try {
      const response = await expensesAPI.getByGroupId(id);
      if (Array.isArray(response)) {
        setExpenses(response);
      } else {
        console.error('Invalid expenses response:', response);
        setExpenseError('Invalid expenses data received.');
        setExpenses([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch expenses:', err);
      setExpenseError(err.response?.data?.meta?.message || err.message || 'Failed to load expenses.');
      setExpenses([]);
    } finally {
      setLoadingExpenses(false);
    }
  };

  const fetchDebts = async () => {
    if (!id) return;
    setLoadingDebts(true);
    try {
      const simplifiedRes = await debtsAPI.getSimplified(id);
      setSimplifiedDebts(simplifiedRes);

      const allRes = await debtsAPI.getByGroupId(id);
      setAllDebts(allRes);
    } catch (err: any) {
      console.error('Failed to fetch debts:', err);
      setDebtError(err.response?.data?.meta?.message || 'Failed to load debts.');
    } finally {
      setLoadingDebts(false);
    }
  };

  const fetchMembersData = async (memberIds: string[]) => {
    setLoadingMembers(true);
    try {
        const memberPromises = memberIds.map(memberId => usersAPI.getById(memberId));
        const userObjects = await Promise.all(memberPromises);
        const userProfiles: UserProfile[] = userObjects.map(user => ({
          id: user._id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl
        }));
        console.log("Fetched membersData:", userProfiles);
        setMembersData(userProfiles);
    } catch (err: any) {
        console.error('Failed to fetch member details:', err);
        setMemberError(err.response?.data?.meta?.message || 'Failed to load member details.');
    } finally {
        setLoadingMembers(false);
    }
  };


  const fetchSentInvites = async () => {
    if (!id || !user?._id) {
      setLoadingInvites(false);
      return;
    }
    setLoadingInvites(true);
    try {
      const response = await invitesAPI.getGroupInvites(id, user._id);
      setSentInvites(response);
    } catch (err: any) {
      console.error('Failed to fetch invites:', err);
      setInviteError(err.response?.data?.meta?.message || 'Failed to load invites.');
    } finally {
      setLoadingInvites(false);
    }
  };

  useEffect(() => {
    fetchGroupDetails();
    fetchExpenses();
    fetchDebts();
    fetchSentInvites();
  }, [id]);

  useEffect(() => {
    if (group && group.memberIds && group.memberIds.length > 0) {
        fetchMembersData(group.memberIds);
    }
  }, [group]);


  const onCreateExpenseSuccess = () => {
    setShowCreateExpenseModal(false);
    fetchExpenses();
    fetchDebts();
  };

  const handleEditExpense = (expenseId: string) => {
    const expense = expenses.find(exp => exp.id === expenseId);
    if (expense) {
      setExpenseToEdit(expense);
      setShowEditExpenseModal(true);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expensesAPI.delete(expenseId);
        fetchExpenses();
        fetchDebts();
      } catch (err: any) {
        console.error('Failed to delete expense:', err);
        alert(err.response?.data?.meta?.message || 'Failed to delete expense.');
      }
    }
  };

  const handleOpenPayDebtModal = (debt: DebtResponseDTO) => {
    setDebtToPay(debt);
    setIsPayDebtModalOpen(true);
  };

  const handleMarkDebtPaid = async (debtId: string, amount: number, method: string) => {
    try {
      await debtsAPI.payDebt(debtId, { amount, method });
      fetchDebts();
      alert('Debt marked as paid successfully!');
    } catch (err: any) {
      console.error('Failed to mark debt as paid:', err);
      alert(err.response?.data?.meta?.message || 'Failed to mark debt as paid.');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!group?._id || !user?._id) return;
    if (window.confirm(`Are you sure you want to remove ${memberId} from the group?`)) {
        try {
            await groupsAPI.deleteMember(group._id, memberId, user._id);
            alert('Member removed successfully.');
            fetchGroupDetails();
        } catch (err: any) {
            console.error('Failed to remove member:', err);
            alert(err.response?.data?.meta?.message || 'Failed to remove member.');
        }
    }
  };

  const handleLeaveGroup = async () => {
    if (!group?._id || !user?._id) return;
    if (window.confirm('Are you sure you want to leave this group?')) {
        try {
            await groupsAPI.leaveGroup(group._id, user._id);
            alert('You have left the group.');
            navigate('/');
        } catch (err: any) {
            console.error('Failed to leave group:', err);
            alert(err.response?.data?.meta?.message || 'Failed to leave group.');
        }
    }
  };

  const handleEditGroup = () => {
    setShowEditGroupModal(true);
  };

  const handleDeleteGroup = async () => {
    if (!group?._id) return;
    if (window.confirm(`Are you sure you want to delete the group "${group.name}"? This action cannot be undone.`)) {
      try {
        await groupsAPI.delete(group._id);
        alert('Group deleted successfully.');
        navigate('/');
      } catch (err: any) {
        console.error('Failed to delete group:', err);
        alert(err.response?.data?.meta?.message || 'Failed to delete group.');
      }
    }
  };

  const findMemberName = (memberId: string) => {
    const member = membersData.find(m => m.id === memberId);
    return member ? member.name : 'Unknown User';
  };

  if (loading) {
    return <div className="text-center mt-8">Loading group details...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-600">Error: {error}</div>;
  }

  if (!group) {
    return <div className="text-center mt-8 text-gray-600">Group not found.</div>;
  }

  const isOwner = user && group.memberIds && group.memberIds.length > 0 && group.memberIds[0] === user._id;
  const isMember = group.memberIds && group.memberIds.includes(user?._id || '');


  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{group.name}</h1>
        <div>
          <Link to="/" className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2">
            Back to Home
          </Link>
          {isOwner && (
            <>
              <button 
                onClick={handleEditGroup}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
              >
                Edit Group
              </button>
              <button 
                onClick={handleDeleteGroup}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Delete Group
              </button>
            </>
          )}
          {!isOwner && isMember && (
             <button
                onClick={handleLeaveGroup}
                className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
             >
                Leave Group
             </button>
          )}
        </div>
      </div>

      <p className="text-gray-700 mb-4">{group.description}</p>

      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`${
              activeTab === 'expenses'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Expenses
          </button>
          <button
            onClick={() => setActiveTab('debts')}
            className={`${
              activeTab === 'debts'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Debts
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`${
              activeTab === 'members'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Members
          </button>
          <button
            onClick={() => setActiveTab('invites')}
            className={`${
              activeTab === 'invites'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Invites
          </button>
        </nav>
      </div>

      <div>
        {activeTab === 'expenses' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Expenses</h2>
            <button
              onClick={() => setShowCreateExpenseModal(true)}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4"
            >
              Add New Expense
            </button>
            {loadingExpenses ? (
              <p>Loading expenses...</p>
            ) : expenseError ? (
              <p className="text-red-600">Error loading expenses: {expenseError}</p>
            ) : expenses.length === 0 ? (
              <p>No expenses found in this group.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {expenses.map((expense) => (
                  <ExpenseCard
                    key={expense.id}
                    expense={expense}
                    onEdit={handleEditExpense}
                    onDelete={handleDeleteExpense}
                  />
                ))}
              </div>
            )}

            {showCreateExpenseModal && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                  <h3 className="text-lg font-bold mb-4">Create New Expense</h3>
                  <CreateExpensePage
                    groupId={group._id}
                    participants={membersData || []}
                    onSuccess={onCreateExpenseSuccess}
                    onCancel={() => setShowCreateExpenseModal(false)}
                  />
                </div>
              </div>
            )}

            {showEditExpenseModal && expenseToEdit && group && (
              <EditExpenseModal
                isOpen={showEditExpenseModal}
                onClose={() => setShowEditExpenseModal(false)}
                onSuccess={() => {
                  setShowEditExpenseModal(false);
                  fetchExpenses();
                  fetchDebts();
                }}
                groupId={group._id}
                members={membersData}
                expense={expenseToEdit}
              />
            )}
          </div>
        )}
        {activeTab === 'debts' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Debts</h2>
            <div className="mb-4">
              <button
                onClick={() => setShowAllDebts(false)}
                className={`mr-2 py-2 px-4 rounded ${!showAllDebts ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                Simplified Debts
              </button>
              <button
                onClick={() => setShowAllDebts(true)}
                className={`py-2 px-4 rounded ${showAllDebts ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                All Debts
              </button>
            </div>

            {loadingDebts ? (
              <p>Loading debts...</p>
            ) : debtError ? (
              <p className="text-red-600">Error loading debts: {debtError}</p>
            ) : (
              (showAllDebts ? allDebts : simplifiedDebts).length === 0 ? (
                <p>No debts found in this view.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(showAllDebts ? allDebts : simplifiedDebts).map((debt) => (
                    <DebtCard
                      key={debt.id}
                      {...debt}
                      isSimplified={!showAllDebts}
                      fromUserName={findMemberName(debt.fromUserId)}
                      toUserName={findMemberName(debt.toUserId)}
                      onOpenPayDebtModal={() => handleOpenPayDebtModal(debt)}
                    />
                  ))}
                </div>
              )
            )}
            
            {isPayDebtModalOpen && debtToPay && (
              <PayDebtModal
                isOpen={isPayDebtModalOpen}
                onClose={() => setIsPayDebtModalOpen(false)}
                onPay={(amount, method) => {
                  handleMarkDebtPaid(debtToPay.id, amount, method);
                  setIsPayDebtModalOpen(false);
                }}
                debtAmount={debtToPay.amount}
                debtCurrency={debtToPay.currency}
              />
            )}
          </div>
        )}
        {activeTab === 'members' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Members</h2>
            {loadingMembers ? (
              <p>Loading members...</p>
            ) : memberError ? (
              <p className="text-red-600">Error loading members: {memberError}</p>
            ) : membersData.length === 0 ? (
              <p>No members found in this group.</p>
            ) : (
              <div className="space-y-2">
                {membersData.map((member) => (
                  <div key={member.id} className="bg-gray-50 p-3 rounded-lg shadow-sm flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                    {isOwner && user?._id !== member.id && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'invites' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Invites</h2>
            <button
              onClick={() => setShowSendInviteModal(true)}
              className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded mb-4"
            >
              Send Invite
            </button>

            {loadingInvites ? (
              <p>Loading invites...</p>
            ) : inviteError ? (
              <p className="text-red-600">Error loading invites: {inviteError}</p>
            ) : sentInvites.length === 0 ? (
              <p>No invites sent for this group yet.</p>
            ) : (
              <div className="space-y-2">
                {sentInvites.map((invite) => (
                  <div key={invite.id} className="bg-gray-50 p-3 rounded-lg shadow-sm flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">To: {invite.email}</p>
                      <p className="text-xs text-gray-500">Status: {invite.status}</p>
                      {invite.expiresAt && (
                        <p className="text-xs text-gray-400">Expires: {new Date(invite.expiresAt).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showSendInviteModal && group && (
              <SendInviteModal
                isOpen={showSendInviteModal}
                onClose={() => setShowSendInviteModal(false)}
                onSuccess={() => {
                  setShowSendInviteModal(false);
                  fetchSentInvites();
                }}
                groupId={group._id}
              />
            )}
          </div>
        )}

        {showEditGroupModal && group && (
          <EditGroupModal
            isOpen={showEditGroupModal}
            onClose={() => setShowEditGroupModal(false)}
            onSuccess={() => {
              setShowEditGroupModal(false);
              fetchGroupDetails();
            }}
            group={group}
          />
        )}
      </div>
    </div>
  );
};

interface SendInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  groupId: string;
}

const SendInviteModal: React.FC<SendInviteModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  groupId,
}) => {
  const { user } = useAuth();
  const [recipientEmail, setRecipientEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await invitesAPI.sendInvite(groupId, { email: recipientEmail }, user?._id);
      onSuccess();
    } catch (err: any) {
      console.error('Error sending invite:', err);
      setError(err.response?.data?.meta?.message || 'Failed to send invite.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 ${isOpen ? '' : 'hidden'}`}>
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-bold mb-4">Send Group Invite</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="recipientEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Recipient Email
            </label>
            <input
              type="email"
              id="recipientEmail"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter recipient's email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface EditGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  group: Group;
}

const EditGroupModal: React.FC<EditGroupModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  group,
}) => {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (group) {
      setName(group.name);
      setDescription(group.description);
    }
  }, [group]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await groupsAPI.update(group._id, {
        name,
        description,
        memberIds: group.memberIds || [],
      });
      onSuccess();
          } catch (err: any) {      console.error('Error updating group:', err);      setError(err.response?.data?.meta?.message || 'Failed to update group.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 ${isOpen ? '' : 'hidden'}`}>
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-bold mb-4">Edit Group</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
              Group Name
            </label>
            <input
              type="text"
              id="groupName"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter group name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="groupDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="groupDescription"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter group description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupDetailPage;

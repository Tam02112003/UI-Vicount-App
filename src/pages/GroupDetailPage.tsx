import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { groupsAPI } from '../services/groups';
import { expensesAPI } from '../services/expenses';
import { debtsAPI } from '../services/debts';
import { usersAPI } from '../services/users';
import { invitesAPI } from '../services/invites'; // Import invitesAPI
import { useAuth } from '../context/AuthContext';
import ExpenseCard from '../components/ExpenseCard'; // Import ExpenseCard
import CreateExpensePage from './CreateExpensePage'; // Will be used as a modal
import DebtCard from '../components/DebtCard'; // Import DebtCard
import type { InviteResponseDTO, Group } from '../types'; // Import InviteResponseDTO and Group

interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  payerId: string;
  participants: string[];
  date: string;
  groupId: string;
}

interface Debt {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
  groupId: string;
  expenseId?: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}


const GroupDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth(); // Current logged-in user
  const navigate = useNavigate();

  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'expenses' | 'debts' | 'members' | 'invites'>('expenses');

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState<boolean>(true);
  const [expenseError, setExpenseError] = useState<string | null>(null);
  const [showCreateExpenseModal, setShowCreateExpenseModal] = useState<boolean>(false);
  const [showEditExpenseModal, setShowEditExpenseModal] = useState<boolean>(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

  const [simplifiedDebts, setSimplifiedDebts] = useState<Debt[]>([]);
  const [allDebts, setAllDebts] = useState<Debt[]>([]);
  const [loadingDebts, setLoadingDebts] = useState<boolean>(true);
  const [debtError, setDebtError] = useState<string | null>(null);
  const [showAllDebts, setShowAllDebts] = useState<boolean>(false); // Toggle for simplified vs all debts

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
      // Ensure response is an array
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
      setExpenses([]); // Set empty array on error
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
        const responses = await Promise.all(memberPromises);
        setMembersData(responses);
    } catch (err: any) {
        console.error('Failed to fetch member details:', err);
        setMemberError(err.response?.data?.meta?.message || 'Failed to load member details.');
    } finally {
        setLoadingMembers(false);
    }
  };


  const fetchSentInvites = async () => {
    if (!id) return;
    setLoadingInvites(true);
    try {
      // Assuming a backend endpoint to fetch invites sent for a specific group
      const response = await invitesAPI.getGroupInvites(id); // Need to add this method to invitesAPI
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
    fetchExpenses(); // Fetch expenses when component mounts
    fetchDebts(); // Fetch debts when component mounts
    fetchSentInvites(); // Fetch invites when component mounts
  }, [id]);

  useEffect(() => {
    if (group && group.memberIds && group.memberIds.length > 0) {
        fetchMembersData(group.memberIds);
    }
  }, [group]);


  const onCreateExpenseSuccess = () => {
    setShowCreateExpenseModal(false);
    fetchExpenses(); // Refresh expenses list
    fetchDebts(); // Also refresh debts
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
        fetchExpenses(); // Refresh the list
        fetchDebts(); // Also refresh debts
      } catch (err: any) {
        console.error('Failed to delete expense:', err);
        alert(err.response?.data?.meta?.message || 'Failed to delete expense.');
      }
    }
  };

  const handleMarkDebtPaid = async (debtId: string, amount: number, method: string) => {
    if (window.confirm(`Mark this debt (${amount} ${group?.currency}) as paid via ${method}?`)) {
      try {
        await debtsAPI.payDebt(debtId, { amount, method });
        fetchDebts(); // Refresh debts list
        alert('Debt marked as paid successfully!');
      } catch (err: any) {
        console.error('Failed to mark debt as paid:', err);
        alert(err.response?.data?.meta?.message || 'Failed to mark debt as paid.');
      }
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!group?.id || !user?.sub) return;
    if (window.confirm(`Are you sure you want to remove ${memberId} from the group?`)) {
        try {
            // Need to pass actingUserId from headers, but for simplicity, we use the authenticated user
            await groupsAPI.deleteMember(group._id, memberId, user._id);
            alert('Member removed successfully.');
            fetchGroupDetails(); // Refresh group details to update member list
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
            // Need to pass userId from headers
            await groupsAPI.leaveGroup(group._id, user._id);
            alert('You have left the group.');
            navigate('/'); // Go back to home page
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
        navigate('/'); // Go back to home page
      } catch (err: any) {
        console.error('Failed to delete group:', err);
        alert(err.response?.data?.meta?.message || 'Failed to delete group.');
      }
    }
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

  // Owner is typically the first member in the memberIds array
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

      {/* Tabs */}
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

      {/* Tab Content */}
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
                    {...expense}
                    onEdit={handleEditExpense}
                    onDelete={handleDeleteExpense}
                  />
                ))}
              </div>
            )}

            {/* Create Expense Modal */}
            {showCreateExpenseModal && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                  <h3 className="text-lg font-bold mb-4">Create New Expense</h3>
                  <CreateExpensePage
                    groupId={group._id}
                    participants={group.memberIds || []} // Pass group memberIds as participants
                    onSuccess={onCreateExpenseSuccess}
                    onCancel={() => setShowCreateExpenseModal(false)}
                  />
                </div>
              </div>
            )}

            {/* Edit Expense Modal (Placeholder) */}
            {showEditExpenseModal && expenseToEdit && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                  <h3 className="text-lg font-bold mb-4">Edit Expense</h3>
                  <p>Edit form for expense {expenseToEdit.id} will go here.</p>
                  <button onClick={() => setShowEditExpenseModal(false)}>Close</button>
                </div>
              </div>
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
                      onMarkPaid={handleMarkDebtPaid}
                    />
                  ))}
                </div>
              )
            )}
          </div>
        )}
        {activeTab === 'members' && <div><h2 className="text-2xl font-semibold mb-4">Members</h2><p>Members list will go here.</p></div>}
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
                    {/* Add actions like resend/cancel based on invite.status */}
                  </div>
                ))}
              </div>
            )}

            {/* Send Invite Modal */}
            {showSendInviteModal && group && (
              <SendInviteModal
                isOpen={showSendInviteModal}
                onClose={() => setShowSendInviteModal(false)}
                onSuccess={() => {
                  setShowSendInviteModal(false);
                  fetchSentInvites(); // Refresh invites list
                }}
                groupId={group._id}
              />
            )}
          </div>
        )}

        {/* Edit Group Modal */}
        {showEditGroupModal && group && (
          <EditGroupModal
            isOpen={showEditGroupModal}
            onClose={() => setShowEditGroupModal(false)}
            onSuccess={() => {
              setShowEditGroupModal(false);
              fetchGroupDetails(); // Refresh group details
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
  const { user } = useAuth(); // Get current user for X-User-Id header
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

  // Update form when group changes
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
    } catch (err: any) {
      console.error('Error updating group:', err);
      setError(err.response?.data?.meta?.message || 'Failed to update group.');
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
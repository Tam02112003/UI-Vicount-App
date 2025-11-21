import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Modal from '../UI/Modal';
import Input from '../UI/Input';
import Button from '../UI/Button';
import { expensesAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import type { CreateExpenseRequest, User } from '../../types';

const schema = yup.object({
  amount: yup.number().positive('Số tiền phải lớn hơn 0').required('Số tiền là bắt buộc'),
  description: yup.string().required('Mô tả là bắt buộc'),
  category: yup.string().required('Danh mục là bắt buộc'),
  date: yup.string().required('Ngày là bắt buộc'),
  participants: yup.array().of(yup.string()).min(1, 'Phải có ít nhất 1 người tham gia'),
});

interface CreateExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  groupId: string;
  members: User[];
}

const categories = [
  'Food',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Bills',
  'Travel',
  'Other',
];

const CreateExpenseModal: React.FC<CreateExpenseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  groupId,
  members,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<Omit<CreateExpenseRequest, 'groupId' | 'payerId' | 'currency' | 'participants'>>({
    resolver: yupResolver(schema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    setValue('participants', selectedParticipants);
  }, [selectedParticipants, setValue]);

  const onSubmit = async (data: any) => {
    if (!user) return;

    setLoading(true);
    try {
      const expenseData: CreateExpenseRequest = {
        ...data,
        groupId,
        payerId: user._id,
        currency: user.currency,
        participants: selectedParticipants,
        amount: Number(data.amount),
        date: new Date(data.date).toISOString(),
      };

      await expensesAPI.create(expenseData);
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error creating expense:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedParticipants([]);
    onClose();
  };

  const toggleParticipant = (userId: string) => {
    setSelectedParticipants(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Thêm chi tiêu mới">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Mô tả"
          {...register('description')}
          error={errors.description?.message}
          placeholder="Ví dụ: Cơm trưa nhà hàng ABC"
        />

        <Input
          label="Số tiền"
          type="number"
          step="1000"
          {...register('amount')}
          error={errors.amount?.message}
          placeholder="0"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Danh mục
          </label>
          <select
            {...register('category')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Chọn danh mục</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        <Input
          label="Ngày"
          type="date"
          {...register('date')}
          error={errors.date?.message}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Người tham gia
          </label>
          <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg">
            {members.map((member) => (
              <label
                key={member._id}
                className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <input
                  type="checkbox"
                  checked={selectedParticipants.includes(member._id)}
                  onChange={() => toggleParticipant(member._id)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">
                    {member.name}
                  </div>
                  <div className="text-sm text-gray-500">{member.email}</div>
                </div>
              </label>
            ))}
          </div>
          {errors.participants && (
            <p className="mt-1 text-sm text-red-600">{errors.participants.message}</p>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={handleClose}>
            Hủy
          </Button>
          <Button type="submit" loading={loading}>
            Thêm chi tiêu
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateExpenseModal;
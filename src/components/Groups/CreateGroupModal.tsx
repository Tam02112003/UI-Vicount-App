import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Modal from '../UI/Modal';
import Input from '../UI/Input';
import Button from '../UI/Button';
import { groupsAPI, usersAPI } from '../../services/api';
import type { CreateGroupRequest, User } from '../../types';

const schema = yup.object({
  name: yup.string().required('Tên nhóm là bắt buộc'),
  description: yup.string().required('Mô tả là bắt buộc'),
  memberIds: yup.array().of(yup.string()).min(1, 'Phải có ít nhất 1 thành viên'),
});

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateGroupRequest>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    setValue('memberIds', selectedMembers);
  }, [selectedMembers, setValue]);

  const loadUsers = async () => {
    try {
      const data = await usersAPI.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const onSubmit = async (data: CreateGroupRequest) => {
    setLoading(true);
    try {
      await groupsAPI.create(data);
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedMembers([]);
    onClose();
  };

  const toggleMember = (userId: string) => {
    setSelectedMembers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Tạo nhóm mới">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Tên nhóm"
          {...register('name')}
          error={errors.name?.message}
          placeholder="Nhập tên nhóm"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả
          </label>
          <textarea
            {...register('description')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            rows={3}
            placeholder="Nhập mô tả nhóm"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chọn thành viên
          </label>
          <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg">
            {users.map((user) => (
              <label
                key={user._id}
                className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(user._id)}
                  onChange={() => toggleMember(user._id)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">
                    {user.name}
                  </div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </label>
            ))}
          </div>
          {errors.memberIds && (
            <p className="mt-1 text-sm text-red-600">{errors.memberIds.message}</p>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={handleClose}>
            Hủy
          </Button>
          <Button type="submit" loading={loading}>
            Tạo nhóm
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateGroupModal;
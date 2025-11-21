import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Wallet } from 'lucide-react';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { CreateUserRequest } from '../types';

const schema = yup.object({
  name: yup.string().required('Tên là bắt buộc'),
  email: yup.string().email('Email không hợp lệ').required('Email là bắt buộc'),
  password: yup.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').required('Mật khẩu là bắt buộc'),
  currency: yup.string().required('Tiền tệ là bắt buộc'),
});

const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserRequest>({
    resolver: yupResolver(schema),
    defaultValues: {
      currency: 'VND',
    },
  });

  const onSubmit = async (data: CreateUserRequest) => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Attempting register with:', data);
      const response = await authAPI.register(data);
      console.log('Register successful, response:', response);
      
      // Kiểm tra cấu trúc response
      if (!response.token || !response.user) {
        console.error('Invalid response structure:', response);
        setError('Phản hồi từ server không hợp lệ');
        return;
      }
      
      login(response.token, response.user);
      console.log('Auth context updated, navigating to home...');
      navigate('/');
    } catch (err: any) {
      console.error('Register error:', err);
      setError(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Wallet className="h-12 w-12 text-indigo-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Tạo tài khoản Vicount
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Hoặc{' '}
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            đăng nhập vào tài khoản có sẵn
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Input
              label="Họ và tên"
              {...register('name')}
              error={errors.name?.message}
              placeholder="Nguyễn Văn A"
            />

            <Input
              label="Email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              placeholder="your@email.com"
            />

            <Input
              label="Mật khẩu"
              type="password"
              {...register('password')}
              error={errors.password?.message}
              placeholder="••••••••"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiền tệ
              </label>
              <select
                {...register('currency')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="VND">VND (Việt Nam Đồng)</option>
                <option value="USD">USD (US Dollar)</option>
              </select>
              {errors.currency && (
                <p className="mt-1 text-sm text-red-600">{errors.currency.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={loading}
            >
              Tạo tài khoản
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
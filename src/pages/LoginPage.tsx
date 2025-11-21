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
import type { LoginRequest } from '../types';

const schema = yup.object({
  email: yup.string().email('Email không hợp lệ').required('Email là bắt buộc'),
  password: yup.string().required('Mật khẩu là bắt buộc'),
});

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: LoginRequest) => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Attempting login with:', data);
      const response = await authAPI.login(data);
      console.log('Login successful, response:', response);
      
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
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
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
          Đăng nhập vào Vicount
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Hoặc{' '}
          <Link
            to="/register"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            tạo tài khoản mới
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

            <Button
              type="submit"
              className="w-full"
              loading={loading}
            >
              Đăng nhập
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
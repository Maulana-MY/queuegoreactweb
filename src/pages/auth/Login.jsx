import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import TextInput from '../../components/ui/TextInput';
import Button from '../../components/ui/Button';
import { ShieldAlert, KeyRound, UserCheck, Users } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [operatorCode, setOperatorCode] = useState('');
  const [isOperatorAttempt, setIsOperatorAttempt] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // If operator attempt is toggled ON or code field is filled, verify BETA12 secretly
    if (isOperatorAttempt || operatorCode.trim() !== '') {
      if (operatorCode.trim() !== 'BETA12') {
        setError('Kode Keamanan Operator salah! Silakan periksa kembali kode yang Anda masukkan.');
        setIsLoading(false);
        return;
      }
    }

    try {
      const response = await api.post('/api/login', { email, password });
      const userData = response.data.data;
      const userRole = userData?.role || 'user';

      // Security Check: If account is an Operator/Admin, require BETA12
      if (userRole === 'operator' || userRole === 'admin') {
        if (operatorCode.trim() !== 'BETA12') {
          setError('Akun ini adalah akun Operator/Staff. Masukkan Kode Keamanan Operator pada kolom di bawah untuk melanjutkan masuk.');
          setIsOperatorAttempt(true);
          setIsLoading(false);
          return;
        }
      }

      localStorage.setItem('token', response.data.token || 'user_token');
      localStorage.setItem('user', JSON.stringify(userData));

      // Redirect based on role
      if (userRole === 'operator') {
        navigate('/operator');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal masuk. Silakan periksa email dan kata sandi Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="py-8 px-4 sm:px-10 shadow-lg border-none ring-1 ring-gray-900/5">
      <form className="space-y-6" onSubmit={handleLogin}>
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}
        
        <TextInput
          label="Alamat Email"
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@contoh.com"
        />

        <TextInput
          label="Kata Sandi (Password)"
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        {/* Option to specify Operator Login Code */}
        <div className="pt-2 border-t border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsOperatorAttempt(!isOperatorAttempt)}
              className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1.5 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>{isOperatorAttempt ? 'Sembunyikan Kode Operator' : 'Masuk Sebagai Operator / Staff?'}</span>
            </button>
          </div>

          {(isOperatorAttempt || operatorCode.length > 0) && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2 animate-fadeIn">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <KeyRound className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Kode Keamanan Operator</span>
              </div>
              <TextInput
                label="Kode Operator (Wajib untuk Operator)"
                id="operatorCode"
                type="password"
                value={operatorCode}
                onChange={(e) => setOperatorCode(e.target.value)}
                placeholder="Masukkan kode keamanan operator..."
                className="!bg-white"
              />
              <p className="text-[11px] font-medium text-amber-700">
                * Wajib diisi jika Anda masuk menggunakan akun Operator.
              </p>
            </div>
          )}
        </div>

        <Button type="submit" className="w-full font-bold py-3" disabled={isLoading}>
          {isLoading ? 'Memproses Masuk...' : 'Masuk ke Aplikasi'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-gray-600">Belum memiliki akun? </span>
        <Link to="/register" className="font-bold text-primary-600 hover:text-primary-500 transition-colors">
          Daftar di sini
        </Link>
      </div>
    </Card>
  );
};

export default Login;

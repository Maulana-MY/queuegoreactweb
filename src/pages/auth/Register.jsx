import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import TextInput from '../../components/ui/TextInput';
import Button from '../../components/ui/Button';
import { ShieldAlert, KeyRound } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    operatorCode: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Operator Security Code Verification
    if (formData.role === 'operator') {
      if (!formData.operatorCode || formData.operatorCode.trim() !== 'BETA12') {
        setError('Kode Keamanan Operator salah! Silakan periksa kembali kode keamanan Anda.');
        setIsLoading(false);
        return;
      }
    }

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      };
      await api.post('/api/register', payload);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal mendaftar. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="py-8 px-4 sm:px-10 shadow-lg border-none ring-1 ring-gray-900/5">
      <form className="space-y-6" onSubmit={handleRegister}>
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <TextInput
          label="Nama Lengkap"
          id="name"
          name="name"
          type="text"
          required
          value={formData.name}
          onChange={handleChange}
          placeholder="Masukkan nama lengkap"
        />
        
        <TextInput
          label="Alamat Email"
          id="email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
          placeholder="email@contoh.com"
        />

        <TextInput
          label="Kata Sandi (Password)"
          id="password"
          name="password"
          type="password"
          required
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
        />

        <div>
          <label htmlFor="role" className="block text-sm font-bold text-gray-700 mb-1">
            Tipe Akun (Role)
          </label>
          <select
            id="role"
            name="role"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="user">User (Pelanggan Antrean)</option>
            <option value="operator">Operator (Staff / Petugas Loket)</option>
          </select>
        </div>

        {/* Operator Verification Code Field - Shown when role is operator */}
        {formData.role === 'operator' && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 animate-fadeIn">
            <div className="flex items-center gap-2 text-xs font-extrabold text-amber-900">
              <KeyRound className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Verifikasi Keamanan Operator</span>
            </div>
            <TextInput
              label="Kode Keamanan Operator (Wajib untuk Operator)"
              id="operatorCode"
              name="operatorCode"
              type="password"
              required
              value={formData.operatorCode}
              onChange={handleChange}
              placeholder="Masukkan kode keamanan operator..."
              className="!bg-white"
            />
            <p className="text-[11px] font-medium text-amber-700">
              * Pendaftaran sebagai Operator memerlukan kode keamanan resmi instansi/perusahaan.
            </p>
          </div>
        )}

        <Button type="submit" className="w-full font-bold py-3" disabled={isLoading}>
          {isLoading ? 'Memproses Pendaftaran...' : 'Daftar Akun Baru'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-gray-600">Sudah punya akun? </span>
        <Link to="/login" className="font-bold text-primary-600 hover:text-primary-500 transition-colors">
          Masuk di sini
        </Link>
      </div>
    </Card>
  );
};

export default Register;

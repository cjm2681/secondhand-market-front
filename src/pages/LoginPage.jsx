import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Box, TextField, Button, Typography, Alert } from '@mui/material';
import { login } from '../api/auth';
import useAuthStore from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login: loginStore } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await login(form);
      loginStore(res.data.data.accessToken, res.data.data.refreshToken);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || '로그인에 실패했습니다');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h5" textAlign="center">로그인</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <TextField label="이메일" name="email" type="email"
            value={form.email} onChange={handleChange} required fullWidth />
          <TextField label="비밀번호" name="password" type="password"
            value={form.password} onChange={handleChange} required fullWidth />
          <Button type="submit" variant="contained" fullWidth size="large">
            로그인
          </Button>
        </form>
        <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Link to="/signup">회원가입</Link>
          <Link to="/password-reset">비밀번호 찾기</Link>
        </Box>
      </Box>
    </Container>
  );
}
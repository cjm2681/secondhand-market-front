import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Box, TextField, Button,
  Typography, Alert, Stepper, Step, StepLabel
} from '@mui/material';
import { sendPasswordReset, resetPassword } from '../api/auth';

const steps = ['이메일 입력', '코드 확인 및 비밀번호 변경'];

export default function PasswordResetPage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState({ email: '', code: '', newPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSendCode = async () => {
    try {
      await sendPasswordReset(form.email);
      setSuccess('재설정 코드가 발송되었습니다.');
      setActiveStep(1);
    } catch (err) {
      setError(err.response?.data?.message || '이메일 발송에 실패했습니다');
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await resetPassword({
        email: form.email,
        code: form.code,
        newPassword: form.newPassword
      });
      alert('비밀번호가 변경되었습니다. 다시 로그인해주세요.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || '비밀번호 재설정에 실패했습니다');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="h5" textAlign="center">비밀번호 찾기</Typography>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}><StepLabel>{label}</StepLabel></Step>
          ))}
        </Stepper>

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        {activeStep === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="가입한 이메일" name="email" type="email"
              value={form.email} onChange={handleChange} fullWidth />
            <Button variant="contained" onClick={handleSendCode} fullWidth>
              인증코드 발송
            </Button>
          </Box>
        )}

        {activeStep === 1 && (
          <form onSubmit={handleReset}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <TextField label="인증코드 6자리" name="code"
              value={form.code} onChange={handleChange}
              required fullWidth inputProps={{ maxLength: 6 }} />
            <TextField label="새 비밀번호 (8자 이상)" name="newPassword" type="password"
              value={form.newPassword} onChange={handleChange}
              required fullWidth inputProps={{ minLength: 8 }} />
            <Button type="submit" variant="contained" fullWidth>
              비밀번호 변경
            </Button>
          </form>
        )}
      </Box>
    </Container>
  );
}
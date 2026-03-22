import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Box, TextField, Button,
  Typography, Alert, Stepper, Step, StepLabel
} from '@mui/material';
import { sendVerificationEmail, verifyEmail, signup } from '../api/auth';

const steps = ['이메일 인증', '인증코드 확인', '회원가입 완료'];

export default function SignupPage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState({
    email: '', code: '', password: '', nickname: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  // 1단계: 이메일 인증 코드 발송
  const handleSendEmail = async () => {
    try {
      await sendVerificationEmail(form.email);
      setSuccess('인증코드가 발송되었습니다. 이메일을 확인해주세요.');
      setActiveStep(1);
    } catch (err) {
      setError(err.response?.data?.message || '이메일 발송에 실패했습니다');
    }
  };

  // 2단계: 인증코드 확인
  const handleVerifyCode = async () => {
    try {
      await verifyEmail({ email: form.email, code: form.code });
      setSuccess('이메일 인증이 완료되었습니다.');
      setActiveStep(2);
    } catch (err) {
      setError(err.response?.data?.message || '인증코드가 올바르지 않습니다');
    }
  };

  // 3단계: 회원가입
  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await signup({
        email: form.email,
        password: form.password,
        nickname: form.nickname
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || '회원가입에 실패했습니다');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="h5" textAlign="center">회원가입</Typography>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}><StepLabel>{label}</StepLabel></Step>
          ))}
        </Stepper>

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        {/* 1단계: 이메일 입력 */}
        {activeStep === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="이메일" name="email" type="email"
              value={form.email} onChange={handleChange} fullWidth />
            <Button variant="contained" onClick={handleSendEmail} fullWidth>
              인증코드 발송
            </Button>
          </Box>
        )}

        {/* 2단계: 인증코드 입력 */}
        {activeStep === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="인증코드 6자리" name="code"
              value={form.code} onChange={handleChange} fullWidth
              inputProps={{ maxLength: 6 }} />
            <Button variant="contained" onClick={handleVerifyCode} fullWidth>
              인증 확인
            </Button>
            <Button variant="text" onClick={() => { setActiveStep(0); setSuccess(''); }}>
              이메일 재입력
            </Button>
          </Box>
        )}

        {/* 3단계: 닉네임 + 비밀번호 */}
        {activeStep === 2 && (
          <form onSubmit={handleSignup}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <TextField label="닉네임 (2~10자)" name="nickname"
              value={form.nickname} onChange={handleChange}
              required fullWidth inputProps={{ minLength: 2, maxLength: 10 }} />
            <TextField label="비밀번호 (8자 이상)" name="password" type="password"
              value={form.password} onChange={handleChange}
              required fullWidth inputProps={{ minLength: 8 }} />
            <Button type="submit" variant="contained" fullWidth size="large">
              가입 완료
            </Button>
          </form>
        )}
      </Box>
    </Container>
  );
}
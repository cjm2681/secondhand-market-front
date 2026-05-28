import { useEffect, useState, useRef} from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Typography, CircularProgress, Alert } from '@mui/material';
import { confirmPayment } from '../api/order';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
   const isConfirmed = useRef(false);  // ✅ 중복 실행 방지

  useEffect(() => {
    if (isConfirmed.current) return;  // ✅ 이미 실행됐으면 중단
    isConfirmed.current = true;

    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');

    if (!paymentKey || !orderId || !amount) {
      setError('잘못된 접근입니다.');
      return;
    }

    // 백엔드에 최종 승인 요청
    confirmPayment({
      paymentKey,
      orderId: orderId,    // ✅ ORDER_ replace 제거
      amount: Number(amount),
    })
      .then(() => {
        sessionStorage.removeItem('pendingOrderId'); // 추가
        alert('결제가 완료되었습니다!');
        navigate('/orders',  { replace: true });
      })
      .catch((err) => {
        setError(err.response?.data?.message || '결제 승인에 실패했습니다');
      });
  }, []);

  if (error) {
    return (
      <Container sx={{ mt: 8, textAlign: 'center' }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 8, textAlign: 'center' }}>
      <CircularProgress />
      <Typography sx={{ mt: 2 }}>결제 처리 중...</Typography>
    </Container>
  );
}
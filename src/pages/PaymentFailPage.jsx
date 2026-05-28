import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Alert } from '@mui/material';
import { cancelOrder } from '../api/order';

export default function PaymentFailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const message = searchParams.get('message') || '결제에 실패했습니다';

useEffect(() => {
    const orderId = sessionStorage.getItem('pendingOrderId');
    console.log('pendingOrderId:', orderId);  // 값 있는지 확인
    if (orderId) {
      cancelOrder(orderId)
        .then(() => console.log('주문 취소 성공'))
        .catch((err) => console.error('주문 취소 실패:', err))
        .finally(() => sessionStorage.removeItem('pendingOrderId'));
    }
}, []);

  return (
    <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
      <Alert severity="error" sx={{ mb: 3 }}>{message}</Alert>
      <Button variant="contained" onClick={() => navigate(-1)}>
        돌아가기
      </Button>
    </Container>
  );
}
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Alert } from '@mui/material';
import { cancelOrder } from '../api/order';

export default function PaymentFailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const message = searchParams.get('message') || '결제에 실패했습니다';

  useEffect(() => {
    // 결제 실패 시 주문 취소 → 상품 SALE로 복구
    const orderId = sessionStorage.getItem('pendingOrderId');
    if (orderId) {
      cancelOrder(orderId)
        .catch(console.error)
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
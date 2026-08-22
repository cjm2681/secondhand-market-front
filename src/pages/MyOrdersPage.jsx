import { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Tab, Tabs,
  Card, CardContent, Chip, Button, Divider, Alert
} from '@mui/material';
import { getMyOrders, getMySales, cancelOrder, confirmOrder } from '../api/order';

const statusLabel = {
  READY: { label: '주문접수', color: 'default' },
  PAID: { label: '결제완료', color: 'primary' },
  CANCELLED: { label: '취소됨', color: 'error' },
  CONFIRMED: { label: '구매확정', color: 'success' },
};

const paymentStatusLabel = {
  READY: '결제대기',
  PAID: '결제완료',
  CANCELLED: '결제취소',
  REFUNDED: '환불완료',
};

export default function MyOrdersPage() {
  const [tab, setTab] = useState(0);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [tab]);

  const fetchOrders = async () => {
    setError('');
    try {
      const res = tab === 0 ? await getMyOrders() : await getMySales();
      setOrders(res.data.data);
    } catch {
      setError('주문 내역을 불러올 수 없습니다.');
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('주문을 취소하시겠습니까?')) return;
    try {
      await cancelOrder(orderId);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || '취소에 실패했습니다');
    }
  };

  const handleConfirm = async (orderId) => {
    if (!window.confirm('구매 확정하시겠습니까? 확정 후에는 취소가 불가능합니다.')) return;
    try {
      await confirmOrder(orderId);
      alert('구매가 확정되었습니다.');
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || '오류가 발생했습니다.');
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleString('ko-KR');

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>주문 내역</Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="구매 내역" />
        <Tab label="판매 내역" />
      </Tabs>

      {error && <Alert severity="error">{error}</Alert>}

      {orders.length === 0 ? (
        <Typography textAlign="center" color="text.secondary" sx={{ mt: 4 }}>
          {tab === 0 ? '구매 내역이 없습니다.' : '판매 내역이 없습니다.'}
        </Typography>
      ) : (
        orders.map((order) => (
          <Card key={order.orderId} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {order.productTitle}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label={statusLabel[order.orderStatus]?.label}
                    color={statusLabel[order.orderStatus]?.color}
                    size="small" />
                  <Chip
                    label={paymentStatusLabel[order.paymentStatus]}
                    variant="outlined" size="small" />
                </Box>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="body2">
                  결제금액: <strong>{order.price.toLocaleString()}원</strong>
                </Typography>
                {tab === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    판매자: {order.sellerNickname}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    구매자: {order.buyerNickname}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary">
                  주문일: {formatDate(order.createdAt)}
                </Typography>
                {order.paidAt && (
                  <Typography variant="caption" color="text.secondary">
                    결제일: {formatDate(order.paidAt)}
                  </Typography>
                )}
              </Box>

              {/* 취소 버튼 (구매 내역 + PAID 상태만) */}
              {tab === 0 && order.orderStatus === 'PAID' && (
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button variant="contained" color="primary" size="small"
                    onClick={() => handleConfirm(order.orderId)}>
                    구매 확정
                  </Button>
                  <Button variant="outlined" color="error" size="small"
                    onClick={() => handleCancel(order.orderId)}>
                    주문 취소
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </Container>
  );
}
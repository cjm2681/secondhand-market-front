import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Box, Typography, Button, Chip,
  ImageList, ImageListItem, Divider, Alert
} from '@mui/material';
import { getProduct, deleteProduct, updateProductStatus } from '../api/product';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { createReadyOrder, confirmPayment, cancelOrder } from '../api/order';
import { createOrder } from '../api/order';
import { getOrCreateRoom } from '../api/chat';
import useAuthStore from '../store/authStore';
import { adminDeleteProduct } from '../api/admin';  // ✅ 있는지 확인

const statusLabel = {
  SALE: { label: '판매중', color: 'success' },
  RESERVED: { label: '예약중', color: 'warning' },
  SOLD: { label: '판매완료', color: 'default' },
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');

  // 현재 로그인한 유저 ID (토큰에서 파싱)
  const getCurrentUserId = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Number(payload.sub);
  };
  const currentUserId = getCurrentUserId();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await getProduct(id);
      setProduct(res.data.data);
    } catch {
      setError('상품을 불러올 수 없습니다.');
    }
  };



const handleOrder = async () => {
  if (!isLoggedIn) { navigate('/login'); return; }
  if (!window.confirm('구매하시겠습니까?')) return;

  try {
    // 1단계: 주문 생성 (READY)
    const orderRes = await createReadyOrder({ productId: product.id });
    console.log('1단계 성공:', orderRes.data);   // ✅ 추가
    const order = orderRes.data.data;

    // 결제 실패 시 취소할 수 있도록 저장
    sessionStorage.setItem('pendingOrderId', order.orderId);

    // 2단계: 토스 결제창 띄우기
    const tossPayments = await loadTossPayments(
      import.meta.env.VITE_TOSS_CLIENT_KEY
    );
    console.log('2단계 성공: 토스 로드됨');      // ✅ 추가

    // ✅ payment-sdk는 이 방식
    await tossPayments.requestPayment('카드', {
      amount: order.price,
      orderId: order.tossOrderId,    // ✅ DB id 대신 tossOrderId 사용
      orderName: product.title,
      customerName: '구매자',
      successUrl: `${window.location.origin}/payment/success`,
      failUrl: `${window.location.origin}/payment/fail`,
    });


    //     // ✅ v2 방식: payment 객체 생성 후 requestPayment 호출
    // const payment = tossPayments.payment({
    //   customerKey: `USER_${currentUserId}`,  // "USER_1" 형태로 변경
    // });

    // await payment.requestPayment({
    //   method: 'CARD',
    //   amount: {
    //     currency: 'KRW',
    //     value: order.price,
    //   },
    //   orderId: `ORDER_${order.orderId}`,
    //   orderName: product.title,
    //   successUrl: `${window.location.origin}/payment/success`,
    //   failUrl: `${window.location.origin}/payment/fail`,
    // });

    // await tossPayments.requestPayment('카드', {
    //   amount: order.price,
    //   orderId: String(order.orderId),
    //   orderName: product.title,
    //   customerName: '구매자',  // 실제 서비스에선 로그인 유저 닉네임
    //   successUrl: `${window.location.origin}/payment/success`,
    //   failUrl: `${window.location.origin}/payment/fail`,
    // });      버전바뀌면서 달라졌는지 이게 첫번째버전

} catch (err) {
    if (err.code === 'USER_CANCEL') {
        // 결제창 X 눌러서 취소 → 주문 취소하고 상품 SALE로 복구
        const orderId = sessionStorage.getItem('pendingOrderId');
        if (orderId) {
            await cancelOrder(orderId).catch(console.error);
            sessionStorage.removeItem('pendingOrderId');
        }
        return;
    }
    console.error('결제 오류 전체:', err);
    console.error('응답 데이터:', err.response?.data);
    alert(err.response?.data?.message || '결제 처리 중 오류가 발생했습니다');
}
};




//   const handleOrder = async () => {
//     if (!isLoggedIn) { navigate('/login'); return; }
//     if (!window.confirm('구매하시겠습니까?')) return;
//     try {
//       await createOrder({ productId: product.id });
//       alert('구매가 완료되었습니다!');
//       fetchProduct();   // 상태 새로고침
//     } catch (err) {
//       alert(err.response?.data?.message || '구매에 실패했습니다');
//     }
//   };

  const handleChat = async () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    try {
      await getOrCreateRoom(product.id);
      navigate('/chat');
    } catch (err) {
      alert(err.response?.data?.message || '채팅방 생성에 실패했습니다');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    try {
      await deleteProduct(id);
      navigate('/');
    } catch {
      alert('삭제에 실패했습니다');
    }
  };

  const handleStatusChange = async (status) => {
    try {
      await updateProductStatus(id, status);
      fetchProduct();
    } catch (err) {
      alert(err.response?.data?.message || '상태 변경에 실패했습니다');
    }
  };

  // 어드민 여부 확인 함수 추가
const getRole = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  return JSON.parse(atob(token.split('.')[1])).role;
};
const isAdmin = getRole() === 'ADMIN';

// 어드민 삭제 핸들러 추가
const handleAdminDelete = async () => {
  if (!window.confirm('관리자 권한으로 삭제하시겠습니까?')) return;
  try {
    await adminDeleteProduct(product.id);
    alert('삭제되었습니다.');
    navigate('/');
  } catch {
    alert('삭제에 실패했습니다.');
  }
};


  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;
  if (!product) return <Container sx={{ mt: 4 }}><Typography>로딩 중...</Typography></Container>;

  const isSeller = currentUserId === product.sellerId;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* 이미지 */}
      {product.imageUrls?.length > 0 && (
        <ImageList cols={product.imageUrls.length === 1 ? 1 : 2} gap={8} sx={{ mb: 3 }}>
          {product.imageUrls.map((url, i) => (
            <ImageListItem key={i}>
              <img src={url} alt={`상품이미지${i + 1}`}
                style={{ borderRadius: 8, maxHeight: 400, objectFit: 'cover' }} />
            </ImageListItem>
          ))}
        </ImageList>
      )}

      {/* 상품 정보 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5" fontWeight="bold">{product.title}</Typography>
        <Chip label={statusLabel[product.status]?.label}
          color={statusLabel[product.status]?.color} />
      </Box>

      <Typography variant="h5" color="primary" fontWeight="bold" sx={{ mb: 1 }}>
        {product.price.toLocaleString()}원
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        판매자: {product.sellerNickname} · 조회 {product.viewCount}
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
        {product.description}
      </Typography>

      {/* 버튼 영역 */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {isSeller ? (
          // 판매자 버튼
          <>
            <Button variant="outlined"
              onClick={() => navigate(`/products/${id}/edit`)}>
              수정
            </Button>
            <Button variant="outlined" color="error" onClick={handleDelete}>
              삭제
            </Button>
            {product.status === 'SALE' && (
              <Button variant="outlined" color="warning"
                onClick={() => handleStatusChange('RESERVED')}>
                예약중으로 변경
              </Button>
            )}
            {product.status === 'RESERVED' && (
              <Button variant="outlined" color="success"
                onClick={() => handleStatusChange('SALE')}>
                판매중으로 변경
              </Button>
            )}
          </>
        ) : (
          // 구매자 버튼
          <>
            {product.status === 'SALE' && (
              <Button variant="contained" size="large" onClick={handleOrder}>
                바로 구매
              </Button>
            )}
            <Button variant="outlined" size="large" onClick={handleChat}>
              판매자에게 문의
            </Button>
          </>
        )}

  {/* ✅ 어드민 삭제 버튼 (어드민이고 본인 글 아닐 때) */}
  {isAdmin && !isSeller && (
    <Button variant="contained" color="error" onClick={handleAdminDelete}>
      관리자 삭제
    </Button>
  )}

      </Box>
    </Container>
  );
}
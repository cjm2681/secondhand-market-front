export default function PaymentPendingPage() {
  return (
    <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
      <Alert severity="warning" sx={{ mb: 3 }}>
        결제는 완료됐지만 처리 중입니다.
        잠시 후 주문 내역에서 확인해주세요.
      </Alert>
      <Button variant="contained" onClick={() => navigate('/orders')}>
        주문 내역 보기
      </Button>
    </Container>
  );
}
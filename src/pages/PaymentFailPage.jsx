import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Alert } from '@mui/material';

export default function PaymentFailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const message = searchParams.get('message') || '결제에 실패했습니다';

  return (
    <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
      <Alert severity="error" sx={{ mb: 3 }}>{message}</Alert>
      <Button variant="contained" onClick={() => navigate(-1)}>
        돌아가기
      </Button>
    </Container>
  );
}
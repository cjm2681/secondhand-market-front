import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { logout } from '../api/auth';

export default function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn, logout: logoutStore } = useAuthStore();

  const handleLogout = async () => {
    try { await logout(); } catch {}
    logoutStore();
    navigate('/login');
  };

  const getRole = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  return JSON.parse(atob(token.split('.')[1])).role;
};



  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6" sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}>
          SecondHand Market
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button color="inherit" onClick={() => navigate('/')}>판매글</Button>
          <Button color="inherit" onClick={() => navigate('/boards')}>게시판</Button>
          {isLoggedIn ? (
            <>
              <Button color="inherit" onClick={() => navigate('/chat')}>채팅</Button>
              <Button color="inherit" onClick={() => navigate('/orders')}>주문내역</Button>
              <Button color="inherit" onClick={() => navigate('/profile')}>내 정보</Button>
              <Button color="inherit" onClick={handleLogout}>로그아웃</Button>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={() => navigate('/login')}>로그인</Button>
              <Button color="inherit" onClick={() => navigate('/signup')}>회원가입</Button>
            </>
          )}

          {isLoggedIn && getRole() === 'ADMIN' && (
  <Button color="inherit" onClick={() => navigate('/admin')}>
    어드민
  </Button>
)}

        </Box>
      </Toolbar>
    </AppBar>
  );
}
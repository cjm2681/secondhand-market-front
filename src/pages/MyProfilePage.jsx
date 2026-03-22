import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Box, Typography, TextField, Button,
  Alert, Divider, Paper, Tabs, Tab,
  List, ListItem, ListItemButton, ListItemText, Chip
} from '@mui/material';
import { getMe, updateProfile, updatePassword } from '../api/user';
import { getMyProducts } from '../api/product';
import { getMyBoards } from '../api/board';
import CustomPagination from '../components/CustomPagination';

const statusLabel = {
  SALE:     { label: '판매중',   color: 'success' },
  RESERVED: { label: '예약중',   color: 'warning' },
  SOLD:     { label: '판매완료', color: 'default' },
};

export default function MyProfilePage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [user, setUser] = useState(null);
  const [nickname, setNickname] = useState('');
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [myProducts, setMyProducts] = useState([]);
  const [myBoards, setMyBoards] = useState([]);
  const [myProductPage, setMyProductPage] = useState(1);
  const [myProductTotalPages, setMyProductTotalPages] = useState(1);
  const [myBoardPage, setMyBoardPage] = useState(1);
  const [myBoardTotalPages, setMyBoardTotalPages] = useState(1);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingBoards, setLoadingBoards] = useState(false);

  useEffect(() => {
    getMe().then((res) => {
      setUser(res.data.data);
      setNickname(res.data.data.nickname);
    });
  }, []);

  useEffect(() => {
    if (tab === 1) {
      setLoadingProducts(true);
      getMyProducts(myProductPage - 1)
        .then((res) => {
          setMyProducts(res.data.data.content || []);
          setMyProductTotalPages(res.data.data.page.totalPages);
        })
        .finally(() => setLoadingProducts(false));
    }
    if (tab === 2) {
      setLoadingBoards(true);
      getMyBoards(myBoardPage - 1)
        .then((res) => {
          setMyBoards(res.data.data.content || []);
          setMyBoardTotalPages(res.data.data.page.totalPages);
        })
        .finally(() => setLoadingBoards(false));
    }
  }, [tab, myProductPage, myBoardPage]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    try {
      const res = await updateProfile({ nickname });
      setUser(res.data.data);
      setProfileMsg({ type: 'success', text: '닉네임이 변경되었습니다.' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || '변경에 실패했습니다' });
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });
    try {
      await updatePassword(passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      setPasswordMsg({ type: 'success', text: '비밀번호가 변경되었습니다.' });
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.message || '변경에 실패했습니다' });
    }
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('ko-KR');

  if (!user) return null;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>마이페이지</Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="내 정보" />
        <Tab label="내 판매글" />
        <Tab label="내 게시글" />
      </Tabs>

      {/* 탭 0: 내 정보 */}
      {tab === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>기본 정보</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">이메일: {user.email}</Typography>
              <Typography variant="body2" color="text.secondary">가입일: {formatDate(user.createdAt)}</Typography>
            </Box>
          </Paper>

          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>닉네임 변경</Typography>
            {profileMsg.text && (
              <Alert severity={profileMsg.type} sx={{ mb: 2 }}>{profileMsg.text}</Alert>
            )}
            <form onSubmit={handleProfileUpdate}
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <TextField label="닉네임" value={nickname} size="small"
                onChange={(e) => setNickname(e.target.value)}
                required fullWidth inputProps={{ minLength: 2, maxLength: 10 }} />
              <Button type="submit" variant="contained">변경하기</Button>
            </form>
          </Paper>

          <Divider />

          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>비밀번호 변경</Typography>
            {passwordMsg.text && (
              <Alert severity={passwordMsg.type} sx={{ mb: 2 }}>{passwordMsg.text}</Alert>
            )}
            <form onSubmit={handlePasswordUpdate}
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <TextField label="현재 비밀번호" type="password" size="small"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                required fullWidth />
              <TextField label="새 비밀번호 (8자 이상)" type="password" size="small"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required fullWidth inputProps={{ minLength: 8 }} />
              <Button type="submit" variant="contained">변경하기</Button>
            </form>
          </Paper>
        </Box>
      )}

      {/* 탭 1: 내 판매글 */}
      {tab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" onClick={() => navigate('/products/create')}>
              판매글 작성
            </Button>
          </Box>

          {loadingProducts ? (
            <Typography textAlign="center" color="text.secondary" sx={{ mt: 4 }}>
              불러오는 중...
            </Typography>
          ) : myProducts.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" sx={{ mt: 4 }}>
              작성한 판매글이 없습니다.
            </Typography>
          ) : (
            <List disablePadding>
              {myProducts.map((product) => (
                <Paper key={product.id} variant="outlined" sx={{ mb: 1 }}>
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => navigate(`/products/${product.id}`)}>
                      {product.thumbnailUrl && (
                        <Box component="img" src={product.thumbnailUrl}
                          sx={{ width: 60, height: 60, objectFit: 'cover',
                                borderRadius: 1, mr: 2, flexShrink: 0 }} />
                      )}
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2">{product.title}</Typography>
                            <Chip label={statusLabel[product.status]?.label}
                              color={statusLabel[product.status]?.color} size="small" />
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {product.price.toLocaleString()}원 · {formatDate(product.createdAt)}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                </Paper>
              ))}
            </List>
          )}

          {!loadingProducts && (
            <CustomPagination
              page={myProductPage}
              totalPages={myProductTotalPages}
              onChange={(p) => {
                setMyProductPage(p);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} />
          )}
        </Box>
      )}

      {/* 탭 2: 내 게시글 */}
      {tab === 2 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" onClick={() => navigate('/boards/create')}>
              게시글 작성
            </Button>
          </Box>

          {loadingBoards ? (
            <Typography textAlign="center" color="text.secondary" sx={{ mt: 4 }}>
              불러오는 중...
            </Typography>
          ) : myBoards.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" sx={{ mt: 4 }}>
              작성한 게시글이 없습니다.
            </Typography>
          ) : (
            <List disablePadding>
              {myBoards.map((board) => (
                <Paper key={board.id} variant="outlined" sx={{ mb: 1 }}>
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => navigate(`/boards/${board.id}`)}>
                      <ListItemText
                        primary={board.title}
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            댓글 {board.commentCount} · 조회 {board.viewCount} · {formatDate(board.createdAt)}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                </Paper>
              ))}
            </List>
          )}

          {!loadingBoards && (
            <CustomPagination
              page={myBoardPage}
              totalPages={myBoardTotalPages}
              onChange={(p) => {
                setMyBoardPage(p);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} />
          )}
        </Box>
      )}
    </Container>
  );
}
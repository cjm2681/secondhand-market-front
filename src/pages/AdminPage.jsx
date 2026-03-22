import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Box, Typography, Tabs, Tab,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, TextField,
  Chip, Alert
} from '@mui/material';
import {
  getAdminUsers, getAdminUser, toggleBan,
  adminDeleteProduct, adminDeleteBoard, adminDeleteComment
} from '../api/admin';
import { getProducts } from '../api/product';
import { getBoards } from '../api/board';
import CustomPagination from '../components/CustomPagination';

export default function AdminPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);

  // 회원 관리
  const [users, setUsers] = useState([]);
  const [userKeyword, setUserKeyword] = useState('');
  const [userSearchInput, setUserSearchInput] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // 판매글 관리
  const [products, setProducts] = useState([]);
  const [productPage, setProductPage] = useState(1);
  const [productTotalPages, setProductTotalPages] = useState(1);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // 게시글 관리
  const [boards, setBoards] = useState([]);
  const [boardPage, setBoardPage] = useState(1);
  const [boardTotalPages, setBoardTotalPages] = useState(1);
  const [loadingBoards, setLoadingBoards] = useState(false);

  const [msg, setMsg] = useState({ type: '', text: '' });


  // 판매글 검색 상태 추가
const [productKeyword, setProductKeyword] = useState('');
const [productSearchInput, setProductSearchInput] = useState('');

// 게시글 검색 상태 추가
const [boardKeyword, setBoardKeyword] = useState('');
const [boardSearchInput, setBoardSearchInput] = useState('');

  useEffect(() => {
    if (tab === 0) fetchUsers();
    if (tab === 1) fetchProducts();
    if (tab === 2) fetchBoards();
  }, [tab, userPage, userKeyword, productPage, productKeyword,boardPage, boardKeyword]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await getAdminUsers({
        keyword: userKeyword || undefined,
        page: userPage - 1
      });
      setUsers(res.data.data.content);
      setUserTotalPages(res.data.data.page?.totalPages || res.data.data.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

const fetchProducts = async () => {
  setLoadingProducts(true);
  try {
    const res = await getProducts({
      keyword: productKeyword || undefined,
      page: productPage - 1
    });
    setProducts(res.data.data.content);
    setProductTotalPages(res.data.data.page?.totalPages || 1);
  } catch (err) {
    console.error(err);
  } finally {
    setLoadingProducts(false);
  }
};

const fetchBoards = async () => {
  setLoadingBoards(true);
  try {
    const res = await getBoards({
      keyword: boardKeyword || undefined,
      page: boardPage - 1
    });
    setBoards(res.data.data.content);
    setBoardTotalPages(res.data.data.page?.totalPages || 1);
  } catch (err) {
    console.error(err);
  } finally {
    setLoadingBoards(false);
  }
};


const handleProductSearch = (e) => {
  e.preventDefault();
  setProductKeyword(productSearchInput);
  setProductPage(1);
};

const handleBoardSearch = (e) => {
  e.preventDefault();
  setBoardKeyword(boardSearchInput);
  setBoardPage(1);
};


  const handleToggleBan = async (userId) => {
    try {
      const res = await toggleBan(userId);
      setMsg({ type: 'success', text: res.data.message });
      fetchUsers();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || '처리 실패' });
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('판매글을 삭제하시겠습니까?')) return;
    try {
      await adminDeleteProduct(productId);
      setMsg({ type: 'success', text: '판매글이 삭제되었습니다.' });
      fetchProducts();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || '삭제 실패' });
    }
  };

  const handleDeleteBoard = async (boardId) => {
    if (!window.confirm('게시글을 삭제하시겠습니까?')) return;
    try {
      await adminDeleteBoard(boardId);
      setMsg({ type: 'success', text: '게시글이 삭제되었습니다.' });
      fetchBoards();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || '삭제 실패' });
    }
  };

  const handleUserSearch = (e) => {
    e.preventDefault();
    setUserKeyword(userSearchInput);
    setUserPage(1);
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('ko-KR');

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>어드민 관리</Typography>

      {msg.text && (
        <Alert severity={msg.type} sx={{ mb: 2 }}
          onClose={() => setMsg({ type: '', text: '' })}>
          {msg.text}
        </Alert>
      )}

      <Tabs value={tab} onChange={(_, v) => { setTab(v); setMsg({ type: '', text: '' }); }}
        sx={{ mb: 3 }}>
        <Tab label="회원 관리" />
        <Tab label="판매글 관리" />
        <Tab label="게시글 관리" />
      </Tabs>

      {/* 탭 0: 회원 관리 */}
      {tab === 0 && (
        <Box>
          <form onSubmit={handleUserSearch}>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField size="small" placeholder="이메일 또는 닉네임 검색"
                value={userSearchInput}
                onChange={(e) => setUserSearchInput(e.target.value)}
                sx={{ flex: 1 }} />
              <Button type="submit" variant="outlined">검색</Button>
            </Box>
          </form>

          {loadingUsers ? (
            <Typography textAlign="center" color="text.secondary">불러오는 중...</Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell>ID</TableCell>
                    <TableCell>이메일</TableCell>
                    <TableCell>닉네임</TableCell>
                    <TableCell>권한</TableCell>
                    <TableCell>상태</TableCell>
                    <TableCell>가입일</TableCell>
                    <TableCell align="center">관리</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                        회원이 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.nickname}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.role === 'ADMIN' ? '어드민' : '일반'}
                            color={user.role === 'ADMIN' ? 'primary' : 'default'}
                            size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.status === 'ACTIVE' ? '정상' : '정지'}
                            color={user.status === 'ACTIVE' ? 'success' : 'error'}
                            size="small" />
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell align="center">
                          {user.role !== 'ADMIN' && (
                            <Button
                              size="small"
                              variant="outlined"
                              color={user.status === 'ACTIVE' ? 'error' : 'success'}
                              onClick={() => handleToggleBan(user.id)}>
                              {user.status === 'ACTIVE' ? '정지' : '정지 해제'}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {!loadingUsers && (
            <CustomPagination
              page={userPage}
              totalPages={userTotalPages}
              onChange={(p) => setUserPage(p)} />
          )}
        </Box>
      )}

      {/* 탭 1: 판매글 관리 */}
      {tab === 1 && (
        <Box>
          {loadingProducts ? (
            <Typography textAlign="center" color="text.secondary">불러오는 중...</Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell>ID</TableCell>
                    <TableCell>제목</TableCell>
                    <TableCell>판매자</TableCell>
                    <TableCell>가격</TableCell>
                    <TableCell>상태</TableCell>
                    <TableCell>등록일</TableCell>
                    <TableCell align="center">관리</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                        판매글이 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => (
                      <TableRow key={product.id} hover>
                        <TableCell>{product.id}</TableCell>
                        <TableCell>
                          <Typography
                            variant="body2" sx={{ cursor: 'pointer', color: 'primary.main' }}
                            onClick={() => navigate(`/products/${product.id}`)}>
                            {product.title}
                          </Typography>
                        </TableCell>
                        <TableCell>{product.sellerNickname}</TableCell>
                        <TableCell>{product.price.toLocaleString()}원</TableCell>
                        <TableCell>
                          <Chip
                            label={product.status === 'SALE' ? '판매중'
                              : product.status === 'RESERVED' ? '예약중' : '판매완료'}
                            color={product.status === 'SALE' ? 'success'
                              : product.status === 'RESERVED' ? 'warning' : 'default'}
                            size="small" />
                        </TableCell>
                        <TableCell>{formatDate(product.createdAt)}</TableCell>
                        <TableCell align="center">
                          <Button size="small" variant="outlined" color="error"
                            onClick={() => handleDeleteProduct(product.id)}>
                            삭제
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {!loadingProducts && (
            <CustomPagination
              page={productPage}
              totalPages={productTotalPages}
              onChange={(p) => setProductPage(p)} />
          )}

    <form onSubmit={handleProductSearch}>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField size="small" placeholder="제목 검색"
          value={productSearchInput}
          onChange={(e) => setProductSearchInput(e.target.value)}
          sx={{ flex: 1 }} />
        <Button type="submit" variant="outlined">검색</Button>
      </Box>
    </form>

        </Box>
      )}

      {/* 탭 2: 게시글 관리 */}
      {tab === 2 && (
        <Box>
          {loadingBoards ? (
            <Typography textAlign="center" color="text.secondary">불러오는 중...</Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell>ID</TableCell>
                    <TableCell>제목</TableCell>
                    <TableCell>작성자</TableCell>
                    <TableCell>댓글</TableCell>
                    <TableCell>조회수</TableCell>
                    <TableCell>작성일</TableCell>
                    <TableCell align="center">관리</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {boards.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                        게시글이 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    boards.map((board) => (
                      <TableRow key={board.id} hover>
                        <TableCell>{board.id}</TableCell>
                        <TableCell>
                          <Typography
                            variant="body2" sx={{ cursor: 'pointer', color: 'primary.main' }}
                            onClick={() => navigate(`/boards/${board.id}`)}>
                            {board.title}
                          </Typography>
                        </TableCell>
                        <TableCell>{board.nickname}</TableCell>
                        <TableCell>{board.commentCount}</TableCell>
                        <TableCell>{board.viewCount}</TableCell>
                        <TableCell>{formatDate(board.createdAt)}</TableCell>
                        <TableCell align="center">
                          <Button size="small" variant="outlined" color="error"
                            onClick={() => handleDeleteBoard(board.id)}>
                            삭제
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {!loadingBoards && (
            <CustomPagination
              page={boardPage}
              totalPages={boardTotalPages}
              onChange={(p) => setBoardPage(p)} />
          )}

    <form onSubmit={handleBoardSearch}>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField size="small" placeholder="제목 검색"
          value={boardSearchInput}
          onChange={(e) => setBoardSearchInput(e.target.value)}
          sx={{ flex: 1 }} />
        <Button type="submit" variant="outlined">검색</Button>
      </Box>
    </form>

        </Box>
      )}
    </Container>
  );
}
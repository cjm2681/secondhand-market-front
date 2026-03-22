import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Box, Typography, Button, TextField,
  List, ListItem, ListItemButton, ListItemText,
  Divider, Chip
} from '@mui/material';
import { getBoards } from '../api/board';
import useAuthStore from '../store/authStore';
import CustomPagination from '../components/CustomPagination';

export default function BoardListPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBoards();
  }, [page, keyword]);

  const fetchBoards = async () => {
    setLoading(true);
    try {
      const res = await getBoards({ keyword: keyword || undefined, page: page - 1 });
      setBoards(res.data.data.content);
      setTotalPages(res.data.data.page.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setKeyword(searchInput);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('ko-KR');

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">자유게시판</Typography>
        {isLoggedIn && (
          <Button variant="contained" onClick={() => navigate('/boards/create')}>
            글쓰기
          </Button>
        )}
      </Box>

      <form onSubmit={handleSearch}>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField size="small" placeholder="제목 검색"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            sx={{ flex: 1 }} />
          <Button type="submit" variant="outlined">검색</Button>
        </Box>
      </form>

      {loading ? (
        <Typography textAlign="center" color="text.secondary" sx={{ mt: 4 }}>
          불러오는 중...
        </Typography>
      ) : boards.length === 0 ? (
        <Typography textAlign="center" color="text.secondary" sx={{ mt: 4 }}>
          게시글이 없습니다.
        </Typography>
      ) : (
        <List disablePadding>
          {boards.map((board) => (
            <Box key={board.id}>
              <ListItem disablePadding>
                <ListItemButton onClick={() => navigate(`/boards/${board.id}`)}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">{board.title}</Typography>
                        {board.commentCount > 0 && (
                          <Chip label={`댓글 ${board.commentCount}`}
                            size="small" color="primary" variant="outlined" />
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {board.nickname} · {formatDate(board.createdAt)} · 조회 {board.viewCount}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
              <Divider />
            </Box>
          ))}
        </List>
      )}

      {!loading && (
        <CustomPagination
          page={page}
          totalPages={totalPages}
          onChange={handlePageChange} />
      )}
    </Container>
  );
}
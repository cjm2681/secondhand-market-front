import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Box, Typography, Button, TextField,
  Divider, Alert, IconButton, Paper
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ReplyIcon from '@mui/icons-material/Reply';
import { getBoard, deleteBoard, createComment, deleteComment } from '../api/board';
import { adminDeleteBoard, adminDeleteComment } from '../api/admin';
import useAuthStore from '../store/authStore';

export default function BoardDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();
  const [board, setBoard] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [replyTarget, setReplyTarget] = useState(null);
  const [error, setError] = useState('');

  const getCurrentUserId = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    return Number(JSON.parse(atob(token.split('.')[1])).sub);
  };

  const getRole = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    return JSON.parse(atob(token.split('.')[1])).role;
  };

  const currentUserId = getCurrentUserId();
  const isAdmin = getRole() === 'ADMIN';

  useEffect(() => { fetchBoard(); }, [id]);

  const fetchBoard = async () => {
    try {
      const res = await getBoard(id);
      setBoard(res.data.data);
    } catch {
      setError('게시글을 불러올 수 없습니다.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    try {
      await deleteBoard(id);
      navigate('/boards');
    } catch { alert('삭제에 실패했습니다'); }
  };

  const handleAdminDeleteBoard = async () => {
    if (!window.confirm('관리자 권한으로 삭제하시겠습니까?')) return;
    try {
      await adminDeleteBoard(id);
      navigate('/boards');
    } catch { alert('삭제에 실패했습니다.'); }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await createComment(id, {
        content: commentText,
        parentId: replyTarget?.id || null
      });
      setCommentText('');
      setReplyTarget(null);
      fetchBoard();
    } catch (err) {
      alert(err.response?.data?.message || '댓글 작성에 실패했습니다');
    }
  };

  const handleCommentDelete = async (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      await deleteComment(id, commentId);
      fetchBoard();
    } catch { alert('삭제에 실패했습니다'); }
  };

  const handleAdminDeleteComment = async (commentId) => {
    if (!window.confirm('관리자 권한으로 댓글을 삭제하시겠습니까?')) return;
    try {
      await adminDeleteComment(commentId);
      fetchBoard();
    } catch { alert('삭제에 실패했습니다.'); }
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleString('ko-KR');

  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;
  if (!board) return <Container sx={{ mt: 4 }}><Typography>로딩 중...</Typography></Container>;

  const isAuthor = currentUserId === board.userId;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      {/* 게시글 헤더 */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
          {board.title}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {board.nickname} · {formatDate(board.createdAt)} · 조회 {board.viewCount}
          </Typography>

          {/* ✅ isAuthor와 isAdmin 버튼을 같은 레벨에 배치 */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {isAuthor && (
              <>
                <Button size="small" variant="outlined"
                  onClick={() => navigate(`/boards/${id}/edit`)}>
                  수정
                </Button>
                <Button size="small" variant="outlined" color="error"
                  onClick={handleDelete}>
                  삭제
                </Button>
              </>
            )}
            {/* ✅ isAuthor 블록 밖에 있어야 어드민이 다른 사람 글도 삭제 가능 */}
            {isAdmin && !isAuthor && (
              <Button size="small" variant="contained" color="error"
                onClick={handleAdminDeleteBoard}>
                관리자 삭제
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', minHeight: 200, mb: 4 }}>
        {board.content}
      </Typography>

      <Divider sx={{ mb: 3 }} />

      <Typography variant="h6" sx={{ mb: 2 }}>
        댓글 {board.comments?.length || 0}개
      </Typography>

      {board.comments?.map((comment) => (
        <Box key={comment.id} sx={{ mb: 2 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {comment.nickname}
              </Typography>
              {/* ✅ 댓글 버튼들 모두 같은 Box 안에 */}
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {isLoggedIn && !comment.isDeleted && (
                  <IconButton size="small"
                    onClick={() => setReplyTarget(
                      replyTarget?.id === comment.id ? null
                      : { id: comment.id, nickname: comment.nickname }
                    )}>
                    <ReplyIcon fontSize="small" />
                  </IconButton>
                )}
                {currentUserId === comment.userId && !comment.isDeleted && (
                  <IconButton size="small" color="error"
                    onClick={() => handleCommentDelete(comment.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
                {/* ✅ 어드민 댓글 삭제 - 본인 댓글 아닐 때만 */}
                {isAdmin && currentUserId !== comment.userId && !comment.isDeleted && (
                  <IconButton size="small" color="error"
                    onClick={() => handleAdminDeleteComment(comment.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </Box>
            <Typography variant="body2" color={comment.isDeleted ? 'text.disabled' : 'text.primary'}>
              {comment.content}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDate(comment.createdAt)}
            </Typography>
          </Paper>

          {/* 대댓글 목록 */}
          {comment.children?.map((child) => (
            <Paper key={child.id} variant="outlined"
              sx={{ p: 2, ml: 4, mt: 1, bgcolor: 'grey.50' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  ↳ {child.nickname}
                </Typography>
                {/* ✅ 대댓글 버튼들 모두 같은 Box 안에 */}
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {currentUserId === child.userId && !child.isDeleted && (
                    <IconButton size="small" color="error"
                      onClick={() => handleCommentDelete(child.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                  {/* ✅ 어드민 대댓글 삭제 */}
                  {isAdmin && currentUserId !== child.userId && !child.isDeleted && (
                    <IconButton size="small" color="error"
                      onClick={() => handleAdminDeleteComment(child.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </Box>
              <Typography variant="body2"
                color={child.isDeleted ? 'text.disabled' : 'text.primary'}>
                {child.content}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(child.createdAt)}
              </Typography>
            </Paper>
          ))}
        </Box>
      ))}

      {/* 댓글 작성 */}
      {isLoggedIn ? (
        <Box component="form" onSubmit={handleCommentSubmit} sx={{ mt: 3 }}>
          {replyTarget && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="body2" color="primary">
                {replyTarget.nickname}에게 대댓글 작성 중
              </Typography>
              <Button size="small" onClick={() => setReplyTarget(null)}>취소</Button>
            </Box>
          )}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth size="small" multiline rows={2}
              placeholder={replyTarget ? '대댓글을 입력하세요' : '댓글을 입력하세요'}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)} />
            <Button type="submit" variant="contained" sx={{ minWidth: 80 }}>
              등록
            </Button>
          </Box>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
          댓글을 작성하려면 <Button size="small" onClick={() => navigate('/login')}>로그인</Button>이 필요합니다.
        </Typography>
      )}
    </Container>
  );
}
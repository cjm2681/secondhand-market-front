import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container, Box, Typography,
  TextField, Button, Alert
} from '@mui/material';
import { createBoard, updateBoard, getBoard } from '../api/board';

export default function BoardCreatePage() {
  const navigate = useNavigate();
  const { id } = useParams();       // 수정 시 id 있음
  const isEdit = !!id;
  const [form, setForm] = useState({ title: '', content: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      getBoard(id).then((res) => {
        const { title, content } = res.data.data;
        setForm({ title, content });
      });
    }
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isEdit) {
        await updateBoard(id, form);
        navigate(`/boards/${id}`);
      } else {
        const res = await createBoard(form);
        navigate(`/boards/${res.data.data.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || '저장에 실패했습니다');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        {isEdit ? '게시글 수정' : '게시글 작성'}
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <TextField label="제목" name="title" value={form.title}
          onChange={handleChange} required fullWidth
          inputProps={{ maxLength: 200 }} />
        <TextField label="내용" name="content" value={form.content}
          onChange={handleChange} required fullWidth
          multiline rows={12} />
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={() => navigate(-1)}>취소</Button>
          <Button type="submit" variant="contained">
            {isEdit ? '수정 완료' : '등록하기'}
          </Button>
        </Box>
      </form>
    </Container>
  );
}
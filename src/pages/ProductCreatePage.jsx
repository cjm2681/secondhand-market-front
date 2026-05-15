import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container, Box, TextField, Button,
  Typography, Alert, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { createProduct, updateProduct, getProduct } from '../api/product';


export default function ProductCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', price: '' });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState('');

  const { id } = useParams(); // 수정 모드면 id 있음, 작성 모드면 undefined
  const isEditMode = !!id;   // id 있으면 수정 모드

  // 수정 모드일 때 기존 데이터 불러오기
  useEffect(() => {
    if (!isEditMode) return;

    const fetchProduct = async () => {
      try {
        const res = await getProduct(id);
        const product = res.data.data;
        setForm({
          title: product.title,
          description: product.description || '',
          price: product.price,
        });
        // 기존 이미지 URL을 미리보기로 표시
        setPreviews(product.imageUrls || []);
      } catch {
        setError('상품 정보를 불러오지 못했습니다.');
      }
    };

    fetchProduct();
  }, [id]);


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
    e.target.value = '';  // input 초기화 → 같은 파일도 재선택 가능
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setImages(newImages);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const formData = new FormData();
    formData.append('data', new Blob(
      [JSON.stringify({ ...form, price: Number(form.price) })],
      { type: 'application/json' }
    ));
    images.forEach((img) => formData.append('images', img));

    try {
      if (isEditMode) {
        // 수정 모드 → PUT
        await updateProduct(id, formData);
        navigate(`/products/${id}`);
      } else {
        // 작성 모드 → POST
        const res = await createProduct(formData);
        navigate(`/products/${res.data.data.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || '등록에 실패했습니다');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        {isEditMode ? '판매글 수정' : '판매글 작성'}
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <TextField label="제목" name="title" value={form.title}
          onChange={handleChange} required fullWidth inputProps={{ maxLength: 200 }} />

        <TextField label="가격 (원)" name="price" type="number" value={form.price}
          onChange={handleChange} required fullWidth inputProps={{ min: 0 }} />

        <TextField label="상품 설명" name="description" value={form.description}
          onChange={handleChange} fullWidth multiline rows={5} />

        {/* 이미지 업로드 */}
        <Box>
          <Button variant="outlined" component="label" fullWidth>
            이미지 선택 (최대 5장)
            <input type="file" hidden multiple accept="image/*"
              onChange={handleImageChange} />
          </Button>

          {/* 미리보기 */}
          {previews.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
              {previews.map((src, i) => (
                <Box key={i} sx={{ position: 'relative' }}>
                  <img src={src} alt={`미리보기${i}`}
                    style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8 }} />
                  <IconButton size="small"
                    sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'white' }}
                    onClick={() => removeImage(i)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        <Button type="submit" variant="contained" size="large" fullWidth>
          등록하기
        </Button>
        <Button variant="text" onClick={() => navigate(-1)}>취소</Button>
      </form>
    </Container>
  );
}
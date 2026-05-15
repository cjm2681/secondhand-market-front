import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container, Grid, Card, CardContent, CardMedia, CardActionArea,
  Typography, Box, TextField, Button, Chip
} from '@mui/material';
import { getProducts } from '../api/product';
import useAuthStore from '../store/authStore';
import CustomPagination from '../components/CustomPagination';

const statusLabel = {
  SALE:     { label: '판매중',   color: 'success' },
  RESERVED: { label: '예약중',   color: 'warning' },
  SOLD:     { label: '판매완료', color: 'default' },
};

export default function ProductListPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();

    // URL에서 page, keyword 읽어옴
  const page = Number(searchParams.get('page') || 1);
  const keyword = searchParams.get('keyword') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, [page, keyword]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getProducts({
        keyword: keyword || undefined,
        page: page - 1
      });
          console.log('전체 응답:', res.data.data);          // ✅ 추가
    console.log('totalPages:', res.data.data.totalPages); // ✅ 추가
    console.log('총 개수:', res.data.data.totalElements); // ✅ 추가
      setProducts(res.data.data.content);
      setTotalPages(res.data.data.page.totalPages); 
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ page: 1, keyword: searchInput });
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage, keyword });
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flex: 1 }}>
          <TextField size="small" placeholder="상품 검색"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            sx={{ flex: 1 }} />
          <Button type="submit" variant="outlined">검색</Button>
        </form>
        {isLoggedIn && (
          <Button variant="contained" onClick={() => navigate('/products/create')}>
            판매글 작성
          </Button>
        )}
      </Box>

      {loading ? (
        <Typography textAlign="center" color="text.secondary" sx={{ mt: 4 }}>
          불러오는 중...
        </Typography>
      ) : products.length === 0 ? (
        <Typography textAlign="center" color="text.secondary" sx={{ mt: 4 }}>
          등록된 상품이 없습니다.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card>
                <CardActionArea onClick={() => navigate(`/products/${product.id}`)}>
                  {product.thumbnailUrl ? (
                    <CardMedia component="img" height="200"
                      image={product.thumbnailUrl} alt={product.title}
                      sx={{ objectFit: 'cover' }} />
                  ) : (
                    <Box sx={{
                      height: 200, bgcolor: 'grey.200',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Typography color="text.secondary">이미지 없음</Typography>
                    </Box>
                  )}
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip
                        label={statusLabel[product.status]?.label}
                        color={statusLabel[product.status]?.color}
                        size="small" />
                      <Typography variant="body2" color="text.secondary">
                        조회 {product.viewCount}
                      </Typography>
                    </Box>
                    <Typography variant="subtitle1" fontWeight="bold" noWrap>
                      {product.title}
                    </Typography>
                    <Typography variant="body1" color="primary">
                      {product.price.toLocaleString()}원
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {product.sellerNickname}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
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
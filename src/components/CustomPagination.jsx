import { Box, Button, Typography } from '@mui/material';

export default function CustomPagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages < 1) return null;

  const getPageNumbers = () => {
    const half = 2;
    let start = Math.max(1, page - half);
    let end = Math.min(totalPages, page + half);

    if (page - half < 1) {
      end = Math.min(totalPages, end + (half - page + 1));
    }
    if (page + half > totalPages) {
      start = Math.max(1, start - (page + half - totalPages));
    }

    const result = [];
    for (let i = start; i <= end; i++) {
      result.push(i);
    }
    return { pages: result, start, end };
  };

  const { pages, start, end } = getPageNumbers();

  const btnStyle = (isActive) => ({
    minWidth: 36,
    height: 36,
    fontWeight: isActive ? 'bold' : 'normal',
  });

  return (
    <Box sx={{
      display: 'flex', justifyContent: 'center',
      alignItems: 'center', gap: 0.5, mt: 4, mb: 2
    }}>
      <Button size="small" variant="outlined"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        sx={btnStyle(false)}>
        &lt;
      </Button>

      {start > 1 && (
        <>
          <Button size="small"
            variant={page === 1 ? 'contained' : 'outlined'}
            onClick={() => onChange(1)} sx={btnStyle(page === 1)}>
            1
          </Button>
          {start > 2 && (
            <Typography color="text.secondary" sx={{ px: 0.5 }}>...</Typography>
          )}
        </>
      )}

      {pages.map((p) => (
        <Button key={p} size="small"
          variant={p === page ? 'contained' : 'outlined'}
          onClick={() => onChange(p)}
          sx={btnStyle(p === page)}>
          {p}
        </Button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && (
            <Typography color="text.secondary" sx={{ px: 0.5 }}>...</Typography>
          )}
          <Button size="small"
            variant={page === totalPages ? 'contained' : 'outlined'}
            onClick={() => onChange(totalPages)}
            sx={btnStyle(page === totalPages)}>
            {totalPages}
          </Button>
        </>
      )}

      <Button size="small" variant="outlined"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        sx={btnStyle(false)}>
        &gt;
      </Button>
    </Box>
  );
}
import React, { useEffect, useState } from 'react';
import { getDefectiveItems } from '../config/api';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';

export default function DefectiveItemsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getDefectiveItems(1, 50)
      .then(res => {
        setData(res);
        setError(null);
      })
      .catch(() => {
        setError('Failed to fetch defective items.');
        setData(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
  <Paper sx={{ p: 4, mb: 4, boxShadow: 3 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }} color="error.main">
          Defective Items
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          AI-powered defective item detection system
        </Typography>
        {loading && <Typography>Loading...</Typography>}
        {error && <Typography color="error">{error}</Typography>}
        {data && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              {`Total Defective: ${data.total_defective} (showing ${data.items.length})`}
            </Typography>
            <Box sx={{ overflowX: 'auto', background: '#fff', borderRadius: 2, boxShadow: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', margin: '0 auto' }}>
                <thead style={{ background: '#f5f5f5' }}>
                  <tr>
                    <th style={{ padding: 12, borderBottom: '2px solid #eee', textAlign: 'left' }}>Image</th>
                    <th style={{ padding: 12, borderBottom: '2px solid #eee', textAlign: 'left' }}>Name</th>
                    <th style={{ padding: 12, borderBottom: '2px solid #eee', textAlign: 'left' }}>Category</th>
                    <th style={{ padding: 12, borderBottom: '2px solid #eee', textAlign: 'left' }}>Type</th>
                    <th style={{ padding: 12, borderBottom: '2px solid #eee', textAlign: 'left' }}>Colour</th>
                    <th style={{ padding: 12, borderBottom: '2px solid #eee', textAlign: 'left' }}>Stock</th>
                    <th style={{ padding: 12, borderBottom: '2px solid #eee', textAlign: 'left' }}>Year</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: 10 }}>
                        <img src={item.image_url} alt={item.name} style={{ width: 60, height: 70, objectFit: 'cover', borderRadius: 6 }} />
                      </td>
                      <td style={{ padding: 10 }}>{item.name}</td>
                      <td style={{ padding: 10 }}>{item.masterCategory}</td>
                      <td style={{ padding: 10 }}>{item.articleType}</td>
                      <td style={{ padding: 10 }}>{item.baseColour}</td>
                      <td style={{ padding: 10 }}>{item.stock}</td>
                      <td style={{ padding: 10 }}>{item.year}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Box>
        )}
        <Button sx={{ mt: 4 }} variant="outlined" onClick={() => navigate('/owner')}>Back to Dashboard</Button>
      </Paper>
    </Container>
  );
}

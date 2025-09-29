import React, { useState, useMemo } from 'react';
import TopAppBar from '../components/TopAppBar';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import ProductCard from '../components/ProductCard';
import ProductDialog from '../components/ProductDialog';
import Chatbot from '../components/Chatbot';
import { searchTextApi, searchImageApi, fetchCategoryDataSamples } from '../config/analysisApi';
import { fetchInventoryAnalysis } from '../config/analysisApi';
import { fetchForecast } from '../config/predictApi';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { useEffect } from 'react';
 
import CircularProgress from '@mui/material/CircularProgress';
export default function OwnerPage() {
  const [query, setQuery] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [results, setResults] = useState([]);
  const [defaultCategoryResults, setDefaultCategoryResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [forecast, setForecast] = useState(null);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState(null);
 
  const navigate = useNavigate();
  // Defective scan handler: route to /defective-items
  const handleDefectiveScan = () => {
    navigate('/defective-items');
  };
 
  useEffect(() => {
    setLoadingStats(true);
    fetchInventoryAnalysis()
      .then(data => {
        setStats(data);
        if (Array.isArray(data.products)) setResults(data.products);
        setStatsError(null);
      })
      .catch(() => {
        setStatsError('Failed to fetch stats, using mock data.');
        setStats(null);
        setResults([]);
      })
      .finally(() => setLoadingStats(false));
    // Fetch default category samples for product search
    fetchCategoryDataSamples()
      .then(data => {
        const allProducts = Object.values(data).flat();
        setDefaultCategoryResults(allProducts);
      })
      .catch(() => {
        setDefaultCategoryResults([]);
      });
  }, []);
 
  // Stats (prefer API if available)
  const totalProducts = stats?.total_products ?? results.length;
  const lowStockItems = stats?.low_stock_items?.count ?? stats?.low_stock_count ?? results.filter(p => p.stock && p.stock < 5).length;
  const defectiveItems = stats?.defective_count ?? results.filter(p => p.defective).length;
  const overstockItems = stats?.high_stock_items?.count ?? stats?.overstock_count ?? results.filter(p => p.stock && p.stock > 50).length;
 
  // Categories
  const categories = useMemo(() => {
    const cats = new Set(results.map(p => p.masterCategory));
    return ['all', ...cats];
  }, [results]);
 
  // Filtering
  const filteredProducts = (searchText.trim() === '' ? defaultCategoryResults : results).filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(query.toLowerCase()) ||
      (product.masterCategory && product.masterCategory.toLowerCase().includes(query.toLowerCase())) ||
      (product.subCategory && product.subCategory.toLowerCase().includes(query.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || product.masterCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });
 
  // Search button handler
  const handleSearch = async () => {
    setQuery(searchText);
    setSearchLoading(true);
    try {
      const data = await searchTextApi(searchText);
      if (data && Array.isArray(data.results)) {
        setResults(data.results);
      } else {
        setResults([]);
      }
    } catch (err) {
      setResults([]);
    } finally {
      setSearchLoading(false);
    }
  };
 
  // Mock predictive AI forecast — replace with your endpoint later
  function generateForecast() {
    const f = {
      summary: 'Sales expected to rise 12% next month for these SKUs',
      items: filteredProducts.slice(0, 3)
    };
    setForecast(f);
  }
 
  return (
    <div>
      <TopAppBar />
      <Container sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>Owner Dashboard</Typography>
 
        {/* Stats Overview */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2">Total Products</Typography>
              <Typography variant="h5">{totalProducts}</Typography>
              <Typography variant="caption" color="text.secondary">Active inventory items</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2">Low Stock</Typography>
              <Typography variant="h5" color="warning.main">{lowStockItems}</Typography>
              <Typography variant="caption" color="text.secondary">Items need restocking</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2">Defective</Typography>
              <Typography variant="h5" color="error.main">{defectiveItems}</Typography>
              <Typography variant="caption" color="text.secondary">Items need attention</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2">Overstock</Typography>
              <Typography variant="h5" color="info.main">{overstockItems}</Typography>
              <Typography variant="caption" color="text.secondary">Consider promotions</Typography>
            </Paper>
          </Grid>
        </Grid>
 
        {/* Alerts Section (mocked) */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Active Alerts</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {filteredProducts.slice(0, 3).map((p, i) => (
              <Chip key={p.id} label={`Low stock: ${p.name}`} color={i === 0 ? 'error' : i === 1 ? 'warning' : 'info'} />
            ))}
            {filteredProducts.length === 0 && <Typography>No active alerts.</Typography>}
          </Box>
        </Paper>
 
        {/* Product Inventory */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6">Product Inventory</Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              placeholder="Search for products, brands, or categories..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              sx={{ minWidth: 260 }}
              onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
            />
            <Button variant="contained" onClick={handleSearch}>Search</Button>
            <Button variant="outlined" component="label">
              Image Search
              <input
                hidden
                accept="image/*"
                type="file"
                onChange={async e => {
                  const file = e.target.files && e.target.files[0];
                  if (!file) return;
                  setSearchLoading(true);
                  try {
                    const data = await searchImageApi(file);
                    if (data && Array.isArray(data.results)) {
                      setResults(data.results);
                      setSearchText('image'); // force filteredProducts to use results
                    } else {
                      setResults([]);
                    }
                  } catch (err) {
                    setResults([]);
                  } finally {
                    setSearchLoading(false);
                  }
                }}
              />
            </Button>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              {categories.map(category => (
                <Chip
                  key={category}
                  label={category === 'all' ? 'All Products' : category}
                  color={selectedCategory === category ? 'primary' : 'default'}
                  onClick={() => setSelectedCategory(category)}
                  clickable
                  sx={{ borderRadius: 2 }}
                />
              ))}
            </Box>
          </Box>
          {searchLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
              <CircularProgress size={48} />
            </Box>
          ) : (
            <>
              <Grid container spacing={2} sx={{ mt: 2 }}>
                {filteredProducts.map(r => (
                  <Grid item xs={12} sm={6} md={4} key={r.id}>
                    <ProductCard p={r} onOpen={setSelected} />
                  </Grid>
                ))}
              </Grid>
              {filteredProducts.length === 0 && (
                <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
                  No products found matching your search criteria.
                </Typography>
              )}
            </>
          )}
        </Paper>
 
        {/* Analytics Tools */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1">Defect Scanner</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                AI-powered defective item detection system
              </Typography>
              <Button variant="contained" fullWidth onClick={handleDefectiveScan}>
                Run Scan
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1">Predictive Analytics</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                AI-powered demand forecasting and trend analysis
              </Typography>
              <form
                onSubmit={async e => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const product_id = formData.get('product_id');
                  const weeks = Number(formData.get('weeks')) || 4;
                  const lead_time_weeks = Number(formData.get('lead_time_weeks')) || 1;
                  const z = Number(formData.get('z')) || 1.65;
                  try {
                    const result = await fetchForecast({ product_id, weeks, lead_time_weeks, z });
                    navigate('/forecast-results', { state: { forecast: result } });
                  } catch (err) {
                    alert('Failed to fetch forecast.');
                  }
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                <TextField
                  name="product_id"
                  label="Product ID"
                  defaultValue={results[0]?.id || ''}
                  required
                  sx={{ mb: 2 }}
                />
                <TextField name="weeks" label="Weeks" type="number" defaultValue={4} sx={{ mb: 2 }} />
                <TextField name="lead_time_weeks" label="Lead Time (weeks)" type="number" defaultValue={1} sx={{ mb: 2 }} />
                <TextField name="z" label="Z-score" type="number" defaultValue={1.65} sx={{ mb: 2 }} />
                <Button variant="contained" type="submit">Generate Forecast</Button>
              </form>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, opacity: 0.6, pointerEvents: 'none', position: 'relative' }}>
              <Box sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'warning.light', color: 'warning.dark', px: 1, borderRadius: 1, fontSize: 12, fontWeight: 600 }}>Coming Soon</Box>
              <Typography variant="subtitle1">Bulk Operations</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Update multiple products and manage inventory
              </Typography>
              <Button variant="outlined" fullWidth disabled>Bulk Update</Button>
            </Paper>
          </Grid>
        </Grid>
 
        {/* Forecast Table is now shown on /forecast-results page */}
 
      </Container>
      <ProductDialog open={!!selected} onClose={() => setSelected(null)} product={selected} />
      <Chatbot />
    </div>
  );
}
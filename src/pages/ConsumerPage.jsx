import React, { useState, useEffect } from 'react';
import TopAppBar from '../components/TopAppBar';
import {
  Container,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Paper
} from '@mui/material';
import {
  Search as SearchIcon,
  PhotoCamera as CameraIcon,
  ShoppingCart as CartIcon,
  Favorite as HeartIcon,
  FilterList as FilterIcon,
  Star as StarIcon,
  Inventory as PackageIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import ProductCard from '../components/ProductCard';
import ProductDialog from '../components/ProductDialog';
import Chatbot from '../components/Chatbot';
import { searchImageApi, searchTextApi } from '../config/analysisApi';
 
const GradientCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #6B46C1 0%, #9F7AEA 100%)',
  color: theme.palette.common.white,
}));
 
const WhiteTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.common.white,
}));
 
export default function ConsumerPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMasterCategory, setSelectedMasterCategory] = useState('all');
  const [cartItems, setCartItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [selected, setSelected] = useState(null);
 
  // Get unique categories and masterCategories
  const categories = ['all', ...Array.from(new Set(products.map(p => p.masterCategory).filter(Boolean)))];
  const masterCategories = ['all', ...Array.from(new Set(products.map(p => p.masterCategory).filter(Boolean)))]
 
  // Filter products (by search term and category)
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.masterCategory === selectedCategory;
    const matchesMasterCategory = selectedMasterCategory === 'all' || product.masterCategory === selectedMasterCategory;
    // Also filter by search term (searchQuery)
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q ||
      (product.name && product.name.toLowerCase().includes(q)) ||
      (product.masterCategory && product.masterCategory.toLowerCase().includes(q)) ||
      (product.subCategory && product.subCategory.toLowerCase().includes(q));
    return matchesCategory && matchesMasterCategory && matchesSearch;
  });
 
  // Load default products on mount
  useEffect(() => {
    setLoading(true);
    setError(null);
    import('../config/analysisApi').then(({ fetchCategoryDataSamples }) => {
      fetchCategoryDataSamples()
        .then(data => {
          // data is expected to be an object of arrays
          const allProducts = Object.values(data || {}).flat();
          setProducts(allProducts);
          setRecommendedProducts([]);
        })
        .catch(() => {
          setProducts([]);
          setRecommendedProducts([]);
        })
        .finally(() => setLoading(false));
    });
  }, []);
 
  // Search effect
  useEffect(() => {
    if (!searchQuery) return;
    setLoading(true);
    setError(null);
    searchTextApi(searchQuery)
      .then(data => {
        // API returns { results: [], recommendations: [] }
        if (data && Array.isArray(data.results)) {
          setProducts(data.results);
          setRecommendedProducts(Array.isArray(data.recommendations) ? data.recommendations : data.results.slice(0, 3));
        } else {
          setProducts([]);
          setRecommendedProducts([]);
        }
      })
      .catch(err => {
        setError('Failed to fetch products');
        setProducts([]);
        setRecommendedProducts([]);
      })
      .finally(() => setLoading(false));
  }, [searchQuery]);
 
  const handleImageSearch = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const data = await searchImageApi(file);
      if (data && Array.isArray(data.results)) {
        setProducts(data.results);
        setRecommendedProducts(data.results.slice(0, 3));
      }
    } catch (err) {
      setError('Image search failed');
    } finally {
      setLoading(false);
    }
  };
 
  const toggleWishlist = (productId) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };
 
  const addToCart = (productId) => {
    if (!cartItems.includes(productId)) {
      setCartItems(prev => [...prev, productId]);
    }
  };
 
  return (
    <div>
      <TopAppBar />
      <Container sx={{ mt: 4, mb: 6 }}>
        {/* Hero Search Section */}
        <GradientCard sx={{ mb: 4 }}>
          <CardContent sx={{ py: 4 }}>
            <WhiteTypography variant="h4" align="center" gutterBottom>
              Find Your Perfect Product
            </WhiteTypography>
            <WhiteTypography variant="subtitle1" align="center" sx={{ mb: 4 }}>
              Search our inventory with text or upload an image for instant matches
            </WhiteTypography>
            <Box sx={{ maxWidth: 800, mx: 'auto', mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Search for products, brands, or categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') setSearchQuery(searchTerm); }}
                  sx={{
                    bgcolor: 'white',
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { border: 'none' }
                    }
                  }}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
                <Button
                  variant="contained"
                  onClick={() => setSearchQuery(searchTerm)}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={18} /> : <SearchIcon />}
                >
                  {loading ? 'Searching...' : 'Search'}
                </Button>
                <Button
                  variant="contained"
                  component="label"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={18} /> : <CameraIcon />}
                >
                  {loading ? 'Searching...' : 'Image Search'}
                  <input hidden type="file" accept="image/*" onChange={handleImageSearch} />
                </Button>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
              {categories.map(category => (
                <Chip
                  key={category}
                  label={category === 'all' ? 'All Products' : category}
                  onClick={() => setSelectedCategory(category)}
                  sx={{
                    bgcolor: selectedCategory === category ? 'white' : 'rgba(255,255,255,0.2)',
                    color: selectedCategory === category ? 'primary.main' : 'white',
                    '&:hover': {
                      bgcolor: selectedCategory === category ? 'white' : 'rgba(255,255,255,0.3)',
                    }
                  }}
                />
              ))}
            </Box>
          </CardContent>
        </GradientCard>
 
        {/* Shopping Cart Summary */}
        {cartItems.length > 0 && (
          <Paper sx={{ p: 2, mb: 4, borderColor: 'primary.main', borderWidth: 1, borderStyle: 'solid' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CartIcon />
                <Typography variant="h6">
                  Shopping Cart ({cartItems.length} items)
                </Typography>
              </Box>
              <Button variant="contained" color="primary">
                Proceed to Checkout
              </Button>
            </Box>
          </Paper>
        )}
 
        {/* Product Catalog */}
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom>Product Catalog</Typography>
              <Typography variant="subtitle2" color="text.secondary">
                {loading ? 'Searching...' : `${filteredProducts.length} products available • Real-time inventory`}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterIcon color="action" />
                <Typography variant="subtitle2" color="text.secondary">
                  Filter & Sort
                </Typography>
              </Box>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Master Category</InputLabel>
                <Select
                  value={selectedMasterCategory}
                  label="Master Category"
                  onChange={(e) => setSelectedMasterCategory(e.target.value)}
                >
                  {masterCategories.map(cat => (
                    <MenuItem key={cat} value={cat}>
                      {cat === 'all' ? 'All' : cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
 
          {error && (
            <Typography color="error" align="center" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
 
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Grid container spacing={3}>
                {filteredProducts.map(product => (
                  <Grid item xs={12} sm={6} md={4} key={product.id}>
                    <ProductCard
                      p={product}
                      onOpen={setSelected}
                      isWishlisted={wishlist.includes(product.id)}
                      onToggleWishlist={() => toggleWishlist(product.id)}
                    />
                  </Grid>
                ))}
              </Grid>
 
              {!loading && filteredProducts.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <PackageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    No products found
                  </Typography>
                  <Typography color="text.secondary">
                    Try adjusting your search or filter criteria
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Paper>
 
         {/* Recommendations */}
        <Paper sx={{ p: 2, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <StarIcon color="primary" />
            <Typography variant="h6">You Might Like</Typography>
          </Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Personalized recommendations based on your preferences
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', py: 2 }}>
            {recommendedProducts.map(product => (
              <Box key={product.id} sx={{ minWidth: 280 }}>
                <ProductCard
                  p={product}
                  onOpen={setSelected}
                  isWishlisted={wishlist.includes(product.id)}
                  onToggleWishlist={() => toggleWishlist(product.id)}
                />
              </Box>
            ))}
          </Box>
        </Paper>
      </Container>
 
      <ProductDialog open={!!selected} onClose={()=>setSelected(null)} product={selected} />
      <Chatbot />
    </div>
  );
}
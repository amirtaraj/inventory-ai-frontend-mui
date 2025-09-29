import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

export default function ForecastResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const forecast = location.state?.forecast;

  if (!forecast) {
    return (
      <Paper sx={{ p: 4, mt: 6 }}>
        <Typography variant="h6">No forecast data found.</Typography>
        <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate('/owner')}>Back to Owner Page</Button>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 4, mt: 6 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Forecast Results</Typography>
      {forecast.sales_forecast && (
        <>
          <Typography variant="h6" sx={{ mt: 2 }}>Sales Forecast</Typography>
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Week</TableCell>
                  <TableCell>Predicted Quantity</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {forecast.sales_forecast.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.week}</TableCell>
                    <TableCell>{row.pred_qty}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
      {forecast.inventory_plan && (
        <>
          <Typography variant="h6" sx={{ mt: 2 }}>Inventory Plan</Typography>
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Week</TableCell>
                  <TableCell>Predicted Quantity</TableCell>
                  <TableCell>Inventory Needed</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {forecast.inventory_plan.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.week}</TableCell>
                    <TableCell>{row.pred_qty}</TableCell>
                    <TableCell>{row.inventory_needed}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
      {forecast.price_forecast && (
        <>
          <Typography variant="h6" sx={{ mt: 2 }}>Price Forecast</Typography>
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Week</TableCell>
                  <TableCell>Predicted Price</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {forecast.price_forecast.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.week}</TableCell>
                    <TableCell>{row.pred_price}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
      <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate('/owner')}>Back to Owner Page</Button>
    </Paper>
  );
}

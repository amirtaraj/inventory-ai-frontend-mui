// Predictive analytics API for /predict endpoint
import axios from 'axios';
 
const PREDICT_BASE_URL = 'https://myfastapi.loca.lt/';
 
export async function fetchForecast({ product_id, weeks = 4, lead_time_weeks = 1, z = 1.65 }) {
  const url = `${PREDICT_BASE_URL}predict`;
  const payload = { product_id, weeks, lead_time_weeks, z };
 
  try {
    const res = await axios.post(url, payload, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    return res.data;
  } catch (err) {
    console.error("API call failed:", err.message);
    throw err;
  }
}
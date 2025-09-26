// Predictive analytics API for /predict endpoint
import axios from 'axios';
 
const PREDICT_BASE_URL = 'https://kid-cho-pig-strategies.trycloudflare.com/';
 
export async function fetchForecast({ product_id, weeks = 4, lead_time_weeks = 1, z = 1.65 }) {
  const url = `${PREDICT_BASE_URL}predict`;
  const payload = { product_id, weeks, lead_time_weeks, z };
 
  try {
    const res = await axios.post(url, payload, {
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json'
      }
    });
    return res.data;
  } catch (err) {
    if (err.response) {
      // Server responded with a status code outside 2xx
      console.error("API call failed:", err.response.status, err.response.data);
      throw new Error(`API error: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
    } else if (err.request) {
      // No response received
      console.error("No response received:", err.request);
      throw new Error('No response received from /predict endpoint');
    } else {
      // Other error
      console.error("Error setting up request:", err.message);
      throw new Error(`Request setup error: ${err.message}`);
    }
  }
}
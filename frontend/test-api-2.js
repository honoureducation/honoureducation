const axios = require('axios');
axios.post('http://localhost:5002/api/auth/login', { email: 'shakirayoub0198@gmail.com', password: 'password123' }).then(res => {
  const token = res.data.token;
  return axios.get('http://localhost:5002/api/assessments', { headers: { Authorization: `Bearer ${token}` } });
}).then(res => {
  console.log("Success:", res.data.length);
}).catch(err => {
  console.log("Error:", err.response ? err.response.data : err.message);
});

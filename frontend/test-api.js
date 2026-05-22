const axios = require('axios');
axios.get('http://localhost:5002/api/assessments').then(res => {
  console.log("Success:", res.data);
}).catch(err => {
  console.log("Error:", err.message);
  if(err.response) console.log("Response:", err.response.data);
});

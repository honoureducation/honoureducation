const mongoose = require('mongoose');
const uri = "mongodb+srv://future_db_user:aJUNXbMMaU37P43D@cluster0.mw1hrof.mongodb.net/student_assessment?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 }).then(() => {
  console.log("SUCCESS");
  process.exit(0);
}).catch(err => {
  console.error("FAIL", err.message);
  process.exit(1);
});

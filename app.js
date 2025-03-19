const express = require('express');
const cors = require('cors');



const port = 5001;
const app = express();


app.use(cors())
require('./models/gallerySectionSchema')



app.use(express.json());
app.use(require('./routes/album'))


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})




const mongoose = require('mongoose');
const { mongoURl } = require('./keys');


mongoose.connect(mongoURl)


mongoose.connection.on("connected", () => {
    console.log("Mongoose is connected");
})

mongoose.connection.on("error", () => {
    console.log("Mongoose is not connected");
})

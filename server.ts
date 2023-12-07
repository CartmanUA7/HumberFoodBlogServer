import express from 'express';
import fs from 'fs';
import { Post } from './models/Posts';
const cors = require('cors');
const multer = require("multer");
import path from 'path';
const userRouter = require('./routes/userRoutes');
const postRouter = require('./routes/postRoutes');

const app = express();
const port = 3000;
//app.use('/foodImages', express.static(path.join(__dirname, 'foodImages')));
app.use('/foodImages', express.static('foodImages'));
app.post('/insertData', async (req, res) => {
    try {
        const rawData = fs.readFileSync(path.join(__dirname, '../data.json'), 'utf8');

      const jsonData = JSON.parse(rawData);
  
      // Insert the JSON data into the MongoDB collection
      const result = await Post.create(jsonData);
  
      console.log('Data inserted into MongoDB');
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error reading or parsing JSON file or inserting data into MongoDB');
    }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', userRouter);
app.use('/api/posts', postRouter);

app.listen(port, () => {
    console.log(`App listening on port ${port}!`);
    console.log('Backend Is running');
});
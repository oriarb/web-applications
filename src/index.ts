import express, { Request, Response } from 'express';
import postsRoutes from "./routes/postsRoutes";
import mongoose from 'mongoose';
import { connect } from 'mongoose';

const app = express();
const port = process.env.PORT || 3000;

mongoose.connect('mongodb://localhost:27017/test')
    .then(() => console.log("Connected to MongoDB"))
    .catch((error) => console.error("Error connecting to MongoDB:", error));

app.use(express.json());
app.use('/posts', postsRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})

import express, { Request, Response } from 'express';
import postsRoutes from "./routes/postsRoutes";

const app = express();
const port = process.env.PORT || 3000;

app.use('/posts', postsRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})

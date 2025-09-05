import express from "express";
import companyRoutes from "../server/routes/ineco.routes.js";

import cors from "cors";



const app = express();
app.use(cors());
app.use(express.json());


app.use("/api", companyRoutes);
app.use("/",(req,res)=>{
    return res.json({message:"Welcome Inecosystem Bridge"})
})
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
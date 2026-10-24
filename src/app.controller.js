import express from 'express';
import userRouter from './module/books/book.controller.js';

export const bootstrap=()=>{
 const app=express()
 app.use(express.json())

 app.use(userRouter)
app.listen(3000,()=>{
    console.log('server is running on port 3000')
})

}

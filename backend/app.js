import express from "express";
import cors from "cors";
import { connectDB } from "./config/mongoose.js";
import courses from "./models/coursesModal.js";
import { session } from "./models/sessionModel.js";
import Stripe from 'stripe';
import { PurchasedCourse } from "./models/purchasedCourseModal.js";


try{
const app = express();
await connectDB();
app.use(express.json());
const stripeClient = new Stripe(process.env.stripe_secret_key);

app.use(
  cors({
    origin: "http://localhost:5173",
  })
); 


app.get("/", async (req, res) => {
  console.log("get function is running");
  const data=await courses.find();
  return res.json(data);
});

app.post("/create-checkout-session",async (req,res)=>{
  console.log("create checkout session function is running");
  const {id,name,image}=req.body;
  const {price}=await courses.findById(id).lean("price");
  const existingcheckoutsession=await session.findOne({userMobile:req.body.user.mobile,courseId:id,status:"unpaid"});
  //* checking existing checkout session
  if(existingcheckoutsession && existingcheckoutsession.expiresAt > Date.now()){
    return res.json({url:newcheckoutSession.url});
  };

  const newcheckoutSession=await stripeClient.checkout.sessions.create({
       success_url:"http://localhost:5173?session_id={CHECKOUT_SESSION_ID}",
   
       line_items: [
         {
           price_data:{
              product_data:{
                 name:name,
                 description:"Best English Classes In the World",
                 images:[image],
              },
              unit_amount:100*price,
              currency:"inr"
           }, 
          //  adjustable_quantity:{
          //    enabled:true
          //  },   
           quantity:1,
         },
       ],
       metadata:{
          userName:req.body.user.name,
          userMobile:req.body.user.mobile,
          courseId:id,
       },
       mode: 'payment',
  });

  await session.create({
      sessionId:newcheckoutSession.id,
      userName:req.body.user.name,
      userMobile:req.body.user.mobile,
      paymentStatus:"unpaid",
      courseId:id,
      url:newcheckoutSession.url,
  })

  return res.json({url:newcheckoutSession.url});
});

app.post("/verify-payment",async (req,res)=>{
  console.log("verify payment function is running");
  const {sessionId}=req.body;
  if(!sessionId){
    return res.status(400).json({"message":"sessionId is required"});
  }
  try{
  const storedSession=await stripeClient.checkout.sessions.retrieve(sessionId);
  if(storedSession.payment_status== "paid"){
      await session.findOneAndUpdate({sessionId:sessionId},{status:"paid"});
      await PurchasedCourse.create({
        amountPaid:storedSession.amount_total/100,
        accessExpiresAt:new Date(Date.now()+180 * 24 * 60 *60*1000),
        courseId:storedSession.metadata.courseId,
        sessionId:sessionId,
      })
      return res.status(200).json({"message":"payment is successfull"});

  }else{
    return res.status(402).json({"message":"payment is not successful"});
  }
  }catch(err){
    console.log(err.message);
    return res.status(500).json({message: "Internal server error"});
  }


});

app.listen(4000, () => {
  console.log("Server started");
});


}catch(err){
  console.log(err.message);
}
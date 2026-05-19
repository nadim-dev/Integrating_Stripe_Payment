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
const stripeClient = new Stripe(process.env.stripe_secret_key);
const endpointSecret=process.env.endpoint_secret_key;

app.post("/webhook", express.raw({type: 'application/json'}),
async (req,res)=>{
  console.log("Webhook controller is running");
  const signature=req.headers['stripe-signature'];
  let event;
  try {
       event=stripeClient.webhooks.constructEvent(
        req.body,
        signature,
        endpointSecret
      );
    } catch (err) {
      console.log(`⚠️ Webhook signature verification failed.`, err.message);
      return res.sendStatus(400);
    }
   if (event.type !== "checkout.session.completed") {
      return res.status(200).json({received: true,});
   }
  const checkoutSession=event.data.object;
  if(checkoutSession.payment_status == "paid"){
  await Promise.all([
   session.findOneAndUpdate({sessionId: checkoutSession.id}, {paymentStatus:"paid"}),
   PurchasedCourse.create({
      amountPaid: checkoutSession.amount_total / 100,
      accessExpiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      courseId: checkoutSession.metadata.courseId,
      sessionId: checkoutSession.id,
     })
   ]);
    return res.status(200).json({"message":"Data received"});
  }else{
    await session.findOneAndUpdate({sessionId:checkoutSession.id},{paymentStatus:"failed"});
    return res.status(200).json({ message: "Payment not paid" });
  }
}) 


app.use(express.json());
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
  const existingcheckoutsession=await session.findOne({userMobile:req.body.user.mobile,courseId:id});
  console.log("existing checkout session",existingcheckoutsession);
  //* checking existing checkout session
  if(existingcheckoutsession && existingcheckoutsession.expiresAt > Date.now()){
    return res.json({clientSecret: existingcheckoutsession.client_secret});
  };

  const newcheckoutSession=await stripeClient.checkout.sessions.create({
    ui_mode: "embedded_page",
    return_url:"http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}",
     line_items: [
        {
          price_data: {
            product_data: {
              name: name,
              description: "Best English Classes In the World",
              images: [image],
            },
         unit_amount: 100 * price,
         currency: "inr",
        },
          quantity: 1,
        },
      ],

      metadata: {
        userName: req.body.user.name,
        userMobile: req.body.user.mobile,
        courseId: id,
      },
      mode: "payment",
  })

  console.log("Client Secret",newcheckoutSession.client_secret);
  
  await session.create({
      sessionId:newcheckoutSession.id,
      userName:req.body.user.name,
      userMobile:req.body.user.mobile,
      paymentStatus:"unpaid",
      courseId:id,
      client_secret:newcheckoutSession.client_secret,
  })

  return res.json({clientSecret: newcheckoutSession.client_secret});
});

app.post("/verify-payment",async (req,res)=>{
  console.log("verify payment function is running");
  const {sessionId}=req.body;
  if(!sessionId){
    return res.status(400).json({"message":"sessionId is required",success:false});
  }
  try{
    const storedSession=await session.findOne({sessionId:sessionId});
    if(!storedSession){
      return res.status(404).json({"message":"Session not found",success:false});
    }
    return res.status(200).json({
      message:"Payment status fetched successfully",
      success:storedSession.paymentStatus == "paid",
      paymentStatus:storedSession.paymentStatus,
    });
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

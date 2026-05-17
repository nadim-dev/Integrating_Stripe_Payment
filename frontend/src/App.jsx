import React from "react";
import Home from "./home";
import CheckoutPage from "./checkoutPage";
import { createBrowserRouter,RouterProvider } from "react-router-dom";
import { PaymentSuccess } from "./payment_success";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/checkout",
    element: <CheckoutPage />,
  },
  {
    path: "/payment-success",
    element: <PaymentSuccess />,
  },

]);


function App() {
  return <RouterProvider router={router} />;
}

export default App;

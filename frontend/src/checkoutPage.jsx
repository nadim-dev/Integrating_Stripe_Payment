import { useCallback, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function CheckoutPage() {
  const location = useLocation();
  const [error, setError] = useState("");

  const fetchClientSecret = useCallback(async () => {
    const checkoutData = location.state;

    if (!checkoutData?.course || !checkoutData?.user) {
      throw new Error("Checkout details are missing. Please choose a course again.");
    }

    const { course, user } = checkoutData;

    const res = await fetch("http://localhost:4000/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: course.id,
        name: course.name,
        image: course.image,
        user,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.clientSecret) {
      throw new Error(data.message || "Unable to load Stripe payment page.");
    }

    return data.clientSecret;
  }, [location.state]);

  if (!location.state?.course || !location.state?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 text-center shadow-lg">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Checkout details missing
          </h1>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
            Please choose a course again before opening payment.
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Back to courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white">
      {error ? (
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-md rounded-lg border border-rose-200 bg-rose-50 p-5 text-center text-rose-900">
            <h1 className="text-lg font-semibold">Payment could not start</h1>
            <p className="mt-2 text-sm">{error}</p>
            <Link
              to="/"
              className="mt-5 inline-flex rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700"
            >
              Back to courses
            </Link>
          </div>
        </div>
      ) : (
        <div className="min-h-screen w-full">
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{
              fetchClientSecret: async () => {
                try {
                  return await fetchClientSecret();
                } catch (err) {
                  setError(err.message);
                  throw err;
                }
              },
            }}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      )}
    </div>
  );
}

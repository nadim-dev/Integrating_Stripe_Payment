import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export const PaymentSuccess = () => {
  const didVerifyPayment = useRef(false);
  const [paymentResult, setPaymentResult] = useState({
    status: "loading",
    message: "Verifying your payment...",
  });

  useEffect(() => {
    if (didVerifyPayment.current) return;
    didVerifyPayment.current = true;

    async function verifyPayment() {
      const sessionId = new URLSearchParams(location.search).get("session_id");

      if (!sessionId) {
        setPaymentResult({
          status: "error",
          message: "Payment session is missing. Please contact support.",
        });
        return;
      }

      try {
        const res = await fetch("http://localhost:4000/verify-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId }),
        });

        const data = await res.json();
        console.log("verify-payment-result", data);

        setPaymentResult({
          status: res.ok && data.success !== false && data.success !== "false" ? "success" : "error",
          message:
            data.message ||
            (res.ok
              ? "Your payment was successful."
              : "Your payment could not be verified."),
        });
      } catch (err) {
        console.log(err.message);
        setPaymentResult({
          status: "error",
          message: "Unable to verify payment. Please try again.",
        });
      }
    }

    verifyPayment();
  }, []);

  const isLoading = paymentResult.status === "loading";
  const isSuccess = paymentResult.status === "success";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10 dark:bg-gray-900">
      <div className="w-full max-w-lg rounded-lg border border-gray-200 bg-white p-8 text-center shadow-xl dark:border-gray-800 dark:bg-gray-800">
        <div
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold ${
            isLoading
              ? "bg-indigo-100 text-indigo-700"
              : isSuccess
                ? "bg-emerald-100 text-emerald-700"
                : "bg-rose-100 text-rose-700"
          }`}
        >
          {isLoading ? "..." : isSuccess ? "OK" : "!"}
        </div>

        <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
          {isLoading
            ? "Checking payment"
            : isSuccess
              ? "Payment successful"
              : "Payment not verified"}
        </h1>

        <p className="mt-3 text-base text-gray-600 dark:text-gray-300">
          {paymentResult.message}
        </p>

        {isSuccess && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Your course purchase has been saved successfully.
          </p>
        )}

        {!isLoading && (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              Browse courses
            </Link>

            {!isSuccess && (
              <Link
                to="/"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-300 px-5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Try again
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

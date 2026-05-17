import { useEffect, useRef, useState } from "react";
import CourseCard from "./CourseCard";
import { useNavigate } from "react-router-dom";

const response = await fetch("http://localhost:4000/");
const courses = await response.json();

export default function App() {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const didVerifyPayment = useRef(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (didVerifyPayment.current) return;
    didVerifyPayment.current = true;
    
    let hideTimer;
    let removeTimer;

    function showStatus(message, type) {
      setPaymentStatus({ message, type, isVisible: true });

      hideTimer = setTimeout(() => {
        setPaymentStatus((currentStatus) =>
          currentStatus ? { ...currentStatus, isVisible: false } : null
        );
        
      }, 3500);
      removeTimer = setTimeout(() => {
        setPaymentStatus(null);
        window.location.href="/";
      }, 4100);
    }

    async function verifyPayment() {
      try {
        const sessionId = new URLSearchParams(location.search).get(
          "session_id"
        );
        console.log("sessionId", sessionId);

        if (sessionId) {
          const res = await fetch("http://localhost:4000/verify-payment", {
            method: "POST",
            body: JSON.stringify({ sessionId }),
            headers: {
              "Content-Type": "application/json",
            },
          });

          const data = await res.json();
          showStatus(
            data.message || "Payment status checked",
            res.ok ? "success" : "error"
          );
        }
      } catch (err) {
        console.log(err.message);
        showStatus("Unable to verify payment. Please try again.", "error");
      }
    }

    verifyPayment();

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
    };
  }, [navigate]);

  const isSuccess = paymentStatus?.type === "success";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-10">
      {paymentStatus && (
        <div
          className={`fixed right-4 top-5 z-50 w-[calc(100%-2rem)] max-w-sm transform rounded-lg border px-5 py-4 shadow-xl transition-all duration-500 ease-out sm:right-6 ${
            paymentStatus.isVisible
              ? "translate-y-0 opacity-100"
              : "-translate-y-5 opacity-0"
          } ${
            isSuccess
              ? "border-emerald-200 bg-emerald-50 text-emerald-900 shadow-emerald-900/10"
              : "border-rose-200 bg-rose-50 text-rose-900 shadow-rose-900/10"
          }`}
          role="status"
        >
          <div className="flex items-start gap-3">
            <span
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                isSuccess
                  ? "bg-emerald-600 text-white"
                  : "bg-rose-600 text-white"
              }`}
            >
              {isSuccess ? "OK" : "!"}
            </span>
            <div>
              <p className="text-sm font-semibold">
                {isSuccess ? "Payment successful" : "Payment failed"}
              </p>
              <p className="mt-1 text-sm leading-5 opacity-85">
                {paymentStatus.message}
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-7xl pt-6 mx-auto px-4 sm:px-6 lg:px-8 ">
        <h1 className="text-4xl  text-center font-bold text-gray-900 dark:text-white mb-8">
          All Courses
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <CourseCard key={course._id} {...course} />
          ))}
        </div>
      </div>
    </div>
  );
}

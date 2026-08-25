import api from "./axios";

// ==================== PAYMENTS (PaymentController) ====================

// POST /api/payments/create-order  { orderId? }
// Creates (or reuses) the Razorpay order. If orderId is omitted the
// backend picks the student's most recent pending order.
export const createRazorpayOrder = (orderId = null) => {
  return api.post("/api/payments/create-order", orderId ? { orderId } : {});
};

// POST /api/payments/verify
export const verifyPayment = ({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) => {
  return api.post("/api/payments/verify", {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });
};

// ==================== RAZORPAY CHECKOUT ====================

const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

let razorpayScriptPromise = null;

export const loadRazorpayScript = () => {
  if (window.Razorpay) return Promise.resolve(true);
  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => {
      razorpayScriptPromise = null;
      reject(new Error("Failed to load Razorpay Checkout"));
    };
    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
};

/**
 * Full payment flow: create Razorpay order -> open Checkout -> verify.
 *
 * Resolves with PaymentResultResponse on success; rejects if the
 * checkout is dismissed or the gateway/verification fails.
 */
export const payOrder = ({ orderId = null, prefill = {} } = {}) => {
  return loadRazorpayScript().then(() =>
    createRazorpayOrder(orderId).then(({ data: rzp }) => {
      return new Promise((resolve, reject) => {
        const checkout = new window.Razorpay({
          key: rzp.razorpayKeyId,
          amount: rzp.amountInPaise,
          currency: rzp.currency || "INR",
          name: "Foliopath360",
          description: `Order ${rzp.orderNumber}`,
          order_id: rzp.razorpayOrderId,
          prefill,
          theme: { color: "#00A86B" },
          modal: {
            ondismiss: () =>
              reject(
                new Error(
                  "Payment was cancelled before completion. You can retry from your orders."
                )
              ),
          },
          handler: async (response) => {
            try {
              const { data } = await verifyPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              resolve(data);
            } catch (err) {
              reject(err);
            }
          },
        });
        checkout.on("payment.failed", (response) =>
          reject(
            new Error(
              response.error?.description ||
                "Payment failed. Please try again."
            )
          )
        );
        checkout.open();
      });
    })
  );
};

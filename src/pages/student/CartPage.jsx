import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Trash2,
  BookOpen,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Header from "../../components/layout/Header";
import { useAuth } from "../../context/AuthContext";
import {
  getCart,
  removeCartItem,
  clearCart,
} from "../../api/cartService";
import { checkoutCart, getMyOrders } from "../../api/orderService";
import { payOrder } from "../../api/paymentService";

const rupees = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removingItemId, setRemovingItemId] = useState(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    setLoading(true);
    try {
      const { data } = await getCart();
      setCart(data);
      // An order may still be awaiting payment even when the cart is empty
      try {
        const { data: orders } = await getMyOrders();
        const payable = (orders || []).find((o) =>
          ["CREATED", "PAYMENT_PENDING"].includes(o.status)
        );
        setPendingOrder(payable || null);
      } catch {
        setPendingOrder(null);
      }
    } catch (err) {
      console.error("Failed to load cart:", err);
      toast.error(err.response?.data?.message || "Failed to load your cart");
    } finally {
      setLoading(false);
    }
  };

  const completePayment = async (orderId) => {
    try {
      const result = await payOrder({
        orderId,
        prefill: {
          name: [user?.firstName, user?.lastName].filter(Boolean).join(" "),
          email: user?.email,
        },
      });
      const count = result.enrolledCourseIds?.length || 0;
      toast.success(
        `Payment successful!${count > 0 ? ` ${count} course${count > 1 ? "s" : ""} unlocked.` : ""}`,
        { iconTheme: { primary: "#00A86B", secondary: "#fff" }, duration: 4000 }
      );
      window.dispatchEvent(new Event("cart:updated"));
      navigate("/StudentDashboard");
    } catch (err) {
      console.error("Checkout failed:", err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Checkout failed. Please try again."
      );
      loadCart();
    }
  };

  const handlePayNow = async () => {
    setPaying(true);
    let orderId = null;
    try {
      // 1. Convert the active cart into an order.
      //    If the cart was already checked out (e.g. retry after a cancelled
      //    payment), fall back to the most recent order still awaiting payment.
      try {
        const { data: order } = await checkoutCart();
        orderId = order.id;
        window.dispatchEvent(new Event("cart:updated"));
      } catch (err) {
        if (err.response?.status !== 409) throw err;
        if (!pendingOrder) throw new Error("Your cart is empty");
        orderId = pendingOrder.id;
        toast("Resuming your pending order...", { icon: "🧾" });
      }

      // 2. Open Razorpay Checkout and verify the payment.
      //    On success: Payment SUCCESS -> Order PAID -> Enrollment ACTIVE.
      await completePayment(orderId);
    } catch (err) {
      console.error("Checkout failed:", err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Checkout failed. Please try again."
      );
      // Re-sync the cart - checkout may have emptied it before the failure
      loadCart();
    } finally {
      setPaying(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    setRemovingItemId(itemId);
    try {
      await removeCartItem(itemId);
      window.dispatchEvent(new Event("cart:updated"));
      toast.success("Course removed from cart");
      await loadCart();
    } catch (err) {
      console.error("Failed to remove item:", err);
      toast.error(
        err.response?.data?.message || "Failed to remove the course"
      );
    } finally {
      setRemovingItemId(null);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      window.dispatchEvent(new Event("cart:updated"));
      toast.success("Cart cleared");
      await loadCart();
    } catch (err) {
      console.error("Failed to clear cart:", err);
      toast.error(err.response?.data?.message || "Failed to clear the cart");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A86B]" />
      </div>
    );
  }

  const items = cart?.items || [];
  const itemCount = cart?.itemCount ?? items.length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0B2545] flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" />
              My Cart
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {itemCount} course{itemCount === 1 ? "" : "s"} in your cart
            </p>
          </div>
          {itemCount > 0 && (
            <button
              onClick={handleClearCart}
              disabled={paying}
              className="text-sm font-semibold text-slate-500 hover:text-red-500 transition-colors disabled:opacity-60"
            >
              Clear Cart
            </button>
          )}
        </div>

        {itemCount === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-6">Your cart is empty</p>

            {/* An order was created but payment didn't finish */}
            {pendingOrder && (
              <div className="max-w-md mx-auto mb-8 bg-amber-50 border border-amber-200 rounded-xl p-5 text-left">
                <p className="font-bold text-[#0B2545]">
                  Order {pendingOrder.orderNumber} awaits payment
                </p>
                <ul className="mt-2 space-y-1">
                  {(pendingOrder.items || []).map((item) => (
                    <li
                      key={item.itemId}
                      className="text-sm text-slate-600 flex justify-between gap-4"
                    >
                      <span className="truncate">{item.courseTitle}</span>
                      <span className="flex-shrink-0 font-semibold">
                        {rupees(item.price)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 pt-3 border-t border-amber-200 flex items-center justify-between">
                  <span className="font-bold text-[#0B2545]">
                    Total: {rupees(pendingOrder.finalAmount)}
                  </span>
                  <button
                    onClick={() => {
                      setPaying(true);
                      completePayment(pendingOrder.id).finally(() =>
                        setPaying(false)
                      );
                    }}
                    disabled={paying}
                    className="px-4 py-2 bg-[#00A86B] hover:bg-[#008f5a] text-white text-sm font-bold rounded-lg shadow transition-all disabled:opacity-60"
                  >
                    {paying ? "Processing..." : "Complete Payment"}
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => navigate("/courses")}
              className="px-6 py-2.5 bg-[#00A86B] hover:bg-[#008f5a] text-white text-sm font-bold rounded-xl shadow-md transition-all duration-200"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.itemId}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex gap-4"
                >
                  <img
                    src={
                      item.thumbnailUrl ||
                      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80"
                    }
                    alt={item.courseTitle}
                    className="w-28 h-20 object-cover rounded-xl flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">
                      {item.courseCode}
                    </p>
                    <Link
                      to={`/courses/${item.courseId}`}
                      className="block font-bold text-[#0B2545] truncate hover:text-[#00A86B] transition-colors"
                    >
                      {item.courseTitle}
                    </Link>
                    <p className="text-lg font-black text-[#0B2545] mt-1">
                      {rupees(item.price)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.itemId)}
                    disabled={removingItemId === item.itemId || paying}
                    title="Remove from cart"
                    className="self-start p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-60"
                  >
                    {removingItemId === item.itemId ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 self-start sticky top-24">
              <h2 className="font-bold text-[#0B2545] mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{rupees(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Discount</span>
                  <span>-{rupees(cart.discount)}</span>
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between font-bold text-[#0B2545] text-base">
                  <span>Total</span>
                  <span>{rupees(cart.total)}</span>
                </div>
              </div>

              <button
                onClick={handlePayNow}
                disabled={paying}
                className="mt-5 w-full py-3 bg-[#00A86B] hover:bg-[#008f5a] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {paying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Proceed to Pay {rupees(cart.total)}</>
                )}
              </button>

              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                Secure payments powered by Razorpay
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, Trash2, ShoppingCart, Loader2, BookOpen } from "lucide-react";
import { toast } from "react-hot-toast";
import { getCart, removeCartItem } from "../../api/cartService";

const rupees = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function CartDrawer({ open, onClose }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [removingItemId, setRemovingItemId] = useState(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getCart();
      setItems(data?.items || []);
      setCartTotal(data?.total ?? 0);
    } catch {
      setItems([]);
      setCartTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) loadItems();
  }, [open, loadItems]);

  // Keep the drawer in sync when items change elsewhere
  useEffect(() => {
    if (!open) return;
    const handler = () => loadItems();
    window.addEventListener("cart:updated", handler);
    return () => window.removeEventListener("cart:updated", handler);
  }, [open, loadItems]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleRemove = async (itemId) => {
    setRemovingItemId(itemId);
    try {
      await removeCartItem(itemId);
      window.dispatchEvent(new Event("cart:updated"));
      await loadItems();
      toast.success("Course removed from cart");
    } catch (err) {
      console.error("Failed to remove item:", err);
      toast.error(err.response?.data?.message || "Failed to remove course");
    } finally {
      setRemovingItemId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="flex items-center gap-2 font-bold text-[#0B2545]">
            <ShoppingCart className="w-5 h-5" />
            Your Cart
            <span className="text-xs font-semibold text-slate-400">
              ({items.length})
            </span>
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#00A86B]" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <BookOpen className="h-10 w-10 text-slate-300" />
              <p className="text-sm text-slate-500">Your cart is empty</p>
              <button
                onClick={() => {
                  onClose();
                  navigate("/courses");
                }}
                className="text-sm font-semibold text-[#00A86B] hover:text-[#008f5a]"
              >
                Browse Courses
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.itemId}
                  className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3"
                >
                  <img
                    src={
                      item.thumbnailUrl ||
                      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80"
                    }
                    alt={item.courseTitle}
                    className="h-16 w-24 flex-shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      {item.courseCode}
                    </p>
                    <Link
                      to={`/courses/${item.courseId}`}
                      onClick={onClose}
                      className="block truncate text-sm font-semibold text-[#0B2545] hover:text-[#00A86B] transition-colors"
                      title={item.courseTitle}
                    >
                      {item.courseTitle}
                    </Link>
                    <p className="mt-0.5 text-sm font-black text-[#0B2545]">
                      {rupees(item.price)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemove(item.itemId)}
                    disabled={removingItemId === item.itemId}
                    title="Remove from cart"
                    className="self-start rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-60"
                  >
                    {removingItemId === item.itemId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-slate-100 px-5 py-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total</span>
              <span className="font-black text-[#0B2545]">
                {rupees(cartTotal)}
              </span>
            </div>
            <button
              onClick={() => {
                onClose();
                navigate("/cart");
              }}
              className="w-full rounded-xl bg-[#00A86B] py-3 font-bold text-white shadow-md transition-all duration-200 hover:bg-[#008f5a] hover:shadow-lg"
            >
              Checkout
            </button>
            <button
              onClick={onClose}
              className="w-full text-sm font-semibold text-slate-500 hover:text-[#0B2545]"
            >
              Continue browsing
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

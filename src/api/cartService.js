import api from "./axios";

// ==================== CART (CartController) ====================

// POST /api/student/cart/items  { courseId }
export const addToCart = (courseId) => {
  return api.post("/api/student/cart/items", { courseId });
};

// GET /api/student/cart
export const getCart = () => {
  return api.get("/api/student/cart");
};

// DELETE /api/student/cart/items/{itemId}
export const removeCartItem = (itemId) => {
  return api.delete(`/api/student/cart/items/${itemId}`);
};

// DELETE /api/student/cart/clear
export const clearCart = () => {
  return api.delete("/api/student/cart/clear");
};

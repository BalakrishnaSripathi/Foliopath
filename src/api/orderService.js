import api from "./axios";

// ==================== ORDERS (OrderController) ====================

// POST /api/student/orders - converts the active cart into an order
export const checkoutCart = () => {
  return api.post("/api/student/orders");
};

// GET /api/student/orders - order history
export const getMyOrders = () => {
  return api.get("/api/student/orders");
};

// GET /api/student/orders/{orderId}
export const getOrder = (orderId) => {
  return api.get(`/api/student/orders/${orderId}`);
};

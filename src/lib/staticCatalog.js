export const STATIC_PRICE = 499;
export const STATIC_MRP = 999;
export const STATIC_COURSE_ENROLLMENTS = [1249, 986, 642, 2130, 874, 1532];
export const STATIC_KIT_ENROLLMENTS = [1247, 983, 687, 1562, 1108, 742];
export const STATIC_KIT_BADGES = ["Popular", "Bestseller", "New"];

export const enrichCourse = (course, idx = 0) => ({
  ...course,
  enrollmentCount:
    course.enrollmentCount ||
    STATIC_COURSE_ENROLLMENTS[idx % STATIC_COURSE_ENROLLMENTS.length],
  price: STATIC_PRICE,
  originalPrice: STATIC_MRP,
});

export const enrichKit = (kit, idx = 0) => ({
  ...kit,
  price: STATIC_PRICE,
  originalPrice: STATIC_MRP,
  enrollmentCount:
    kit.enrollmentCount ||
    STATIC_KIT_ENROLLMENTS[idx % STATIC_KIT_ENROLLMENTS.length],
  badge: STATIC_KIT_BADGES[idx % STATIC_KIT_BADGES.length],
});
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("express-async-errors");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const cart_routes_1 = __importDefault(require("./routes/cart.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const wishlist_routes_1 = __importDefault(require("./routes/wishlist.routes"));
const review_routes_1 = __importDefault(require("./routes/review.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const hero_routes_1 = __importDefault(require("./routes/hero.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const coupon_routes_1 = __importDefault(require("./routes/coupon.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const blog_routes_1 = __importDefault(require("./routes/blog.routes"));
const store_routes_1 = __importDefault(require("./routes/store.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: {
        policy: "cross-origin",
    },
}));
const allowedOrigins = (process.env.FRONTEND_URL ||
    "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin ||
            allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error("CORS not allowed by server"));
    },
    credentials: true,
}));
app.use((0, compression_1.default)());
app.use(express_1.default.json({
    limit: "10mb",
}));
app.use(express_1.default.urlencoded({
    extended: true,
}));
if (process.env.NODE_ENV !== "test") {
    app.use((0, morgan_1.default)("combined"));
}
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
});
app.use("/api", limiter);
app.get("/health", (_, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
    });
});
/* ---------------- API ROUTES ---------------- */
app.use("/api/auth", auth_routes_1.default);
app.use("/api/products", product_routes_1.default);
app.use("/api/cart", cart_routes_1.default);
app.use("/api/orders", order_routes_1.default);
app.use("/api/users", user_routes_1.default);
app.use("/api/wishlist", wishlist_routes_1.default);
app.use("/api/reviews", review_routes_1.default);
app.use("/api/categories", category_routes_1.default);
app.use("/api/hero-slides", hero_routes_1.default);
app.use("/api/coupons", coupon_routes_1.default);
/* ---------------- UPLOAD ROUTES ---------------- */
app.use("/uploads", express_1.default.static("uploads"));
app.use("/api/upload", upload_routes_1.default);
app.use("/api/blogs", blog_routes_1.default);
app.use("/api/stores", store_routes_1.default);
app.use("/api/notifications", notification_routes_1.default);
/* ---------------- ERROR HANDLER ---------------- */
app.use(error_middleware_1.notFound);
app.use(error_middleware_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map
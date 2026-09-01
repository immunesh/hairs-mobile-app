"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Must be the first import: app.ts and utils/jwt.ts read process.env at module
// load, and ES import hoisting would run them before a dotenv.config() call here.
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const prisma_1 = require("./db/prisma");
const PORT = parseInt(process.env.PORT || '4000', 10);
async function main() {
    await prisma_1.prisma.$connect();
    console.log('Database connected');
    app_1.default.listen(PORT, () => {
        console.log(`HairsUp API running on http://localhost:${PORT}`);
    });
}
main().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map
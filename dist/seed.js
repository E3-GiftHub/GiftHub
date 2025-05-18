"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const mockUser_1 = require("./mockUser");
const prisma = new client_1.PrismaClient();
async function main() {
    await prisma.user.create({
        data: mockUser_1.mockUser,
    });
    console.log('Mock user created!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => {
    void prisma.$disconnect(); // ✅ ESLint-compliant
});

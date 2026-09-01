import nodemailer from 'nodemailer';
export declare const emailTransporter: nodemailer.Transporter<import("nodemailer/lib/smtp-transport").SentMessageInfo, import("nodemailer/lib/smtp-transport").Options>;
interface OrderNotificationItem {
    name: string;
    quantity: number;
    price: number;
}
interface OrderAddress {
    fullName: string;
    phone: string;
    line1: string;
    city: string;
    state: string;
    pincode: string;
}
export declare const notifyOrderStatus: (user: {
    id: string;
    email: string;
    firstName: string;
    emailNotifications: boolean;
}, address: OrderAddress, order: {
    id: string;
    orderNumber: string;
    total: number;
    items: OrderNotificationItem[];
    courier?: string | null;
    awbNumber?: string | null;
}, status: string) => void;
export {};
//# sourceMappingURL=notifications.d.ts.map
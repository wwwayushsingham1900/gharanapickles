import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "",
    });

    const { items, shippingDetails } = await req.json();

    if (!items || !items.length) {
      return NextResponse.json({ success: false, error: "Cart is empty" }, { status: 400 });
    }

    if (!shippingDetails || !shippingDetails.name || !shippingDetails.phone) {
      return NextResponse.json({ success: false, error: "Invalid shipping details" }, { status: 400 });
    }

    // Calculate total
    const totalAmount = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

    // Create Razorpay Order
    // amount in paisa for INR (amount * 100)
    const options = {
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    if (!razorpayOrder) {
      throw new Error("Failed to create Razorpay order");
    }

    // Save "pending_payment" order to Firebase
    const generatedId = `GP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    let orderDocId = "";

    if (db) {
      const ordersRef = collection(db, "orders");
      const orderRef = await addDoc(ordersRef, {
        orderId: generatedId,
        razorpayOrderId: razorpayOrder.id,
        items,
        shippingDetails,
        totalAmount,
        paymentStatus: "pending_payment",
        status: "pending",
        createdAt: new Date().toISOString(),
        adminSecret: "gharanapickles_secure_key_123",
      });
      orderDocId = orderRef.id;
    }

    return NextResponse.json({
      success: true,
      order: razorpayOrder,
      internalOrderId: generatedId,
      orderDocId: orderDocId,
    });
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json({ success: false, error: error.message || "Server Error" }, { status: 500 });
  }
}

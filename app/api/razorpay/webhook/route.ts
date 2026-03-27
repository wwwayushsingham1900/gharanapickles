import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";

    const secret = process.env.RAZORPAY_KEY_SECRET || "";

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (signature !== expectedSignature) {
      return NextResponse.json({ success: false, error: "Invalid webhook signature" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);

    if (payload.event === "payment.captured") {
      const paymentEntity = payload.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;
      
      // Find the order in Firebase by razorpayOrderId
      if (db) {
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("razorpayOrderId", "==", razorpayOrderId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docRef = querySnapshot.docs[0].ref;
          await updateDoc(docRef, {
            paymentStatus: "paid",
            status: "processing", // Mark clear for fulfillment
          });
        }
      }
    }

    // Always return 200 OK so Razorpay knows we received it
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ success: false, error: "Webhook Handler Error" }, { status: 500 });
  }
}

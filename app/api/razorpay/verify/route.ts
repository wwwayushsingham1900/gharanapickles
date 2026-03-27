import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderDocId } = await req.json();

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Payment is successful and verified
      if (db && orderDocId) {
        const orderRef = doc(db, "orders", orderDocId);
        const orderSnap = await getDoc(orderRef);
        
        if (orderSnap.exists()) {
          // Update status
          await updateDoc(orderRef, {
            paymentStatus: "paid",
            status: "processing", // changed from pending to processing as payment is done
          });
        }
      }
      return NextResponse.json({ success: true, message: "Payment verified successfully" });
    } else {
      // Invalid signature
      if (db && orderDocId) {
        const orderRef = doc(db, "orders", orderDocId);
        await updateDoc(orderRef, {
          paymentStatus: "failed",
        });
      }
      return NextResponse.json({ success: false, error: "Invalid payment signature" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Error verifying signature:", error);
    return NextResponse.json({ success: false, error: "Verification Error" }, { status: 500 });
  }
}

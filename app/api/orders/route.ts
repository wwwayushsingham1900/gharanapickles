import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { items, shippingDetails } = await req.json();

    if (!items || !items.length) {
      return NextResponse.json(
        { success: false, error: "Cart is empty" },
        { status: 400 }
      );
    }

    if (!shippingDetails || !shippingDetails.name || !shippingDetails.phone) {
      return NextResponse.json(
        { success: false, error: "Invalid shipping details" },
        { status: 400 }
      );
    }

    // 1. Validate pricing and calculate total.
    // In production, fetch price directly from Firestore instead of relying on client total.
    const totalAmount = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    // 2. Mock Payment Gateway Integration (e.g., Razorpay / Stripe)
    // Here you would create an order in your payment provider and verify signature.
    const paymentStatus = "mock_success"; 

    // 3. Save Order to Firebase 'orders' collection
    let orderId = `mock_${Date.now()}`;
    let message = "Order placed (Firebase offline Mode)";
    
    if (db) {
      const ordersRef = collection(db, "orders");
      const orderRef = await addDoc(ordersRef, {
        items,
        shippingDetails,
        totalAmount,
        paymentStatus,
        status: "pending",
        createdAt: new Date().toISOString(),
        adminSecret: "gharanapickles_secure_key_123", // Authenticate to secure Firestore Rules
      });
      orderId = orderRef.id;
      message = "Order placed successfully";
    }

    // 4. Update Inventory in 'products' collection (Optional based on schema)
    // Client SDK batch updates:
    /*
    if (db) {
      import { writeBatch, doc, increment } from "firebase/firestore";
      const batch = writeBatch(db);
      for (const item of items) {
        ...
      }
      ...
    }
    */

    return NextResponse.json({
      success: true,
      orderId,
      message,
    });

  } catch (error: any) {
    console.error("Order processing error:", error);
    
    // Provide a graceful fallback if Firebase isn't configured yet
    if (error.message.includes("Must be a valid string")) {
       console.warn("Firebase not configured properly. Mocking order success.");
       return NextResponse.json({
         success: true,
         orderId: `mock_${Date.now()}`,
         message: "Order placed (Firebase offline Mode)",
       });
    }

    return NextResponse.json(
      { success: false, error: "Internal server error during checkout" },
      { status: 500 }
    );
  }
}

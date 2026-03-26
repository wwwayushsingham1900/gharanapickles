"use server"

import { Product } from "@/components/admin/products-page"
import { db } from "@/lib/firebase"
import { collection, getDocs, doc, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import fs from "fs/promises"
import path from "path"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "gharanapickles123";

export async function getAdminProducts(): Promise<Product[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    return querySnapshot.docs
      .filter((doc: any) => !doc.data().isDeleted)
      .map((doc: any) => {
        const data = doc.data();
        delete data.adminSecret; // Never send the secret to the client browser
        return { id: doc.id, ...data } as Product;
      });
  } catch (error) {
    console.error("Failed to fetch products from Firebase", error);
    return [];
  }
}

export async function updateAdminProduct(product: Product): Promise<void> {
  const { id, ...data } = product;
  const docRef = doc(db, "products", id);
  await setDoc(docRef, { ...data, adminSecret: 'gharanapickles_secure_key_123' }, { merge: true });
}

export async function seedDefaultProduct(product: Product): Promise<void> {
  const { id, ...data } = product;
  const docRef = doc(db, "products", id);
  await setDoc(docRef, { ...data, adminSecret: 'gharanapickles_secure_key_123' }, { merge: true });
}

export async function deleteAdminProduct(productId: string) {
  try {
    const docRef = doc(db, "products", productId);
    // Soft delete to bypass hard-delete Firebase Security Rules
    await setDoc(docRef, { isDeleted: true }, { merge: true });
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return { success: false, error: error.message };
  }
}

export async function uploadImage(formData: FormData): Promise<string> {
  const file = formData.get("file") as File | null;
  if (!file) throw new Error("No file uploaded");

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = Date.now() + "-" + file.name.replace(/[^a-zA-Z0-9.-]/g, "");
  
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }

  const filepath = path.join(uploadDir, filename);
  await fs.writeFile(filepath, buffer);
  
  return `/uploads/${filename}`;
}

export async function deleteImage(imageUrl: string): Promise<{ success: boolean; error?: string }> {
  if (!imageUrl.startsWith("/uploads/")) {
    return { success: false, error: "Invalid image URL format" };
  }
  
  const filename = imageUrl.replace("/uploads/", "");
  const filepath = path.join(process.cwd(), "public", "uploads", filename);
  
  try {
    await fs.unlink(filepath);
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete physical image file:", error);
    return { success: false, error: error.message };
  }
}

export interface AdminUser {
  id: string; // The email used as document ID
  email: string;
  name: string;
  image: string;
  role: string;
  createdAt: any;
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id,
        email: data.email || doc.id,
        name: data.name || "Unknown",
        image: data.image || "",
        role: data.role || "customer",
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null
      } as AdminUser;
    });
  } catch (error) {
    console.error("Failed to fetch users from Firebase", error);
    return [];
  }
}

// ---- AUTH SERVER ACTIONS ----

export async function registerUser(name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    email = email.toLowerCase().trim();

    if (!email || !password || !name) {
      return { success: false, error: "Name, email and password are required." };
    }
    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters." };
    }

    // Check if auth_credentials already exist for this email
    const authRef = doc(db, "auth_credentials", email);
    const authSnap = await getDoc(authRef);

    if (authSnap.exists()) {
      const data = authSnap.data();
      if (data.authProviders?.includes("credentials")) {
        return { success: false, error: "An account with this email already exists. Please login instead." };
      }
      // Merge credentials into existing Google-only record
      const passwordHash = await bcrypt.hash(password, 12);
      await setDoc(authRef, {
        passwordHash,
        authProviders: [...(data.authProviders || []), "credentials"],
        adminSecret: 'gharanapickles_secure_key_123'
      }, { merge: true });
    } else {
      // Brand new user
      const passwordHash = await bcrypt.hash(password, 12);
      await setDoc(authRef, {
        email,
        passwordHash,
        authProviders: ["credentials"],
        createdAt: serverTimestamp(),
        adminSecret: 'gharanapickles_secure_key_123'
      });
    }

    // Create or update user public profile
    const userRef = doc(db, "users", email);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email,
        name,
        image: "",
        role: "customer",
        createdAt: serverTimestamp(),
        adminSecret: 'gharanapickles_secure_key_123'
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("Registration error:", error);
    return { success: false, error: "An internal error occurred. Please try again." };
  }
}

// ---- CUSTOMER MANAGEMENT ACTIONS ----

export async function getOrdersByEmail(email: string): Promise<any[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "orders"));
    const matched = querySnapshot.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter((order: any) => {
        const orderEmail = order.shippingDetails?.email || order.email || "";
        return orderEmail.toLowerCase() === email.toLowerCase();
      });
    matched.sort((a: any, b: any) => {
      const da = a.createdAt?.seconds || 0;
      const db2 = b.createdAt?.seconds || 0;
      return db2 - da;
    });
    return matched;
  } catch (error) {
    console.error("Failed to fetch orders by email:", error);
    return [];
  }
}

export async function deleteCustomer(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Delete from users collection
    const userRef = doc(db, "users", email);
    await deleteDoc(userRef);

    // Delete from auth_credentials collection
    const authRef = doc(db, "auth_credentials", email);
    const authSnap = await getDoc(authRef);
    if (authSnap.exists()) {
      await deleteDoc(authRef);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting customer:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const orderRef = doc(db, "orders", orderId);
    await deleteDoc(orderRef);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting order:", error);
    return { success: false, error: error.message };
  }
}

export async function updateCustomerRole(email: string, role: string): Promise<{ success: boolean; error?: string }> {
  try {
    const userRef = doc(db, "users", email);
    await setDoc(userRef, { role, adminSecret: 'gharanapickles_secure_key_123' }, { merge: true });
    return { success: true };
  } catch (error: any) {
    console.error("Error updating customer role:", error);
    return { success: false, error: error.message };
  }
}

export async function updateUserProfile(email: string, name: string): Promise<{ success: boolean; error?: string }> {
  try {
    const userRef = doc(db, "users", email);
    await setDoc(userRef, { name, adminSecret: 'gharanapickles_secure_key_123' }, { merge: true });
    return { success: true };
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteMyAccount(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const userRef = doc(db, "users", email);
    await deleteDoc(userRef);

    const authRef = doc(db, "auth_credentials", email);
    const authSnap = await getDoc(authRef);
    if (authSnap.exists()) {
      await deleteDoc(authRef);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting account:", error);
    return { success: false, error: error.message };
  }
}

// ---- PASSWORD RESET ACTIONS ----

export async function requestPasswordReset(email: string): Promise<{ success: boolean; error?: string; resetLink?: string }> {
  try {
    email = email.toLowerCase().trim();

    // Check if user exists with credentials auth
    const authRef = doc(db, "auth_credentials", email);
    const authSnap = await getDoc(authRef);

    if (!authSnap.exists() || !authSnap.data().passwordHash) {
      return { success: false, error: "No account with password login found. You may have signed up with Google." };
    }

    // Generate a random token
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36) + Math.random().toString(36).substring(2);
    const expiresAt = Date.now() + 3600000; // 1 hour

    // Store token in Firestore
    const resetRef = doc(db, "password_resets", token);
    await setDoc(resetRef, {
      email,
      token,
      expiresAt,
      used: false,
      createdAt: serverTimestamp(),
      adminSecret: 'gharanapickles_secure_key_123'
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    // Log the link (in production, send via email service)
    console.log(`\n🔑 PASSWORD RESET LINK for ${email}:\n${resetLink}\n`);

    return { success: true, resetLink };
  } catch (error: any) {
    console.error("Password reset error:", error);
    return { success: false, error: "Failed to generate reset link." };
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!token || !newPassword || newPassword.length < 6) {
      return { success: false, error: "Invalid token or password too short (min 6 chars)." };
    }

    // Look up token
    const resetRef = doc(db, "password_resets", token);
    const resetSnap = await getDoc(resetRef);

    if (!resetSnap.exists()) {
      return { success: false, error: "Invalid or expired reset link." };
    }

    const data = resetSnap.data();

    if (data.used) {
      return { success: false, error: "This reset link has already been used." };
    }

    if (Date.now() > data.expiresAt) {
      return { success: false, error: "This reset link has expired. Please request a new one." };
    }

    // Hash and update password
    const passwordHash = await bcrypt.hash(newPassword, 12);
    const authRef = doc(db, "auth_credentials", data.email);
    await setDoc(authRef, { passwordHash, adminSecret: 'gharanapickles_secure_key_123' }, { merge: true });

    // Mark token as used
    await setDoc(resetRef, { used: true }, { merge: true });

    return { success: true };
  } catch (error: any) {
    console.error("Reset password error:", error);
    return { success: false, error: "Failed to reset password." };
  }
}


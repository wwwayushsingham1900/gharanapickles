import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Prepare FormData for Cloudinary
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", file);
    cloudinaryFormData.append("upload_preset", "my_uploads");

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "YOUR_CLOUD_NAME";
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    console.log("Starting Cloudinary upload...");

    const response = await fetch(cloudinaryUrl, {
      method: "POST",
      body: cloudinaryFormData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Cloudinary Error:", data);
      return NextResponse.json({ error: data.error?.message || "Cloudinary upload failed" }, { status: 500 });
    }

    console.log("Cloudinary upload successful:", data.secure_url);

    return NextResponse.json({ secure_url: data.secure_url });
  } catch (error: any) {
    console.error("API Upload Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

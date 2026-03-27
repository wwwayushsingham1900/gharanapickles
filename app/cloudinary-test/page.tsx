"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";

interface Post {
  id: string;
  caption: string;
  imageUrl: string;
  createdAt: string;
}

export default function CloudinaryUploadTest() {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);

  // Real-time fetch from Firestore
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
      setPosts(postsData);
    });
    return () => unsubscribe();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      console.log("File selected:", selectedFile.name);
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select an image first.");
      return;
    }
    if (!caption.trim()) {
      alert("Please enter a caption.");
      return;
    }

    setUploading(true);
    console.log("Starting upload process...");

    try {
      // 1. Upload to API
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      console.log("URL received from API:", data.secure_url);

      // 2. Save to Firestore
      if (db) {
        await addDoc(collection(db, "posts"), {
          caption: caption,
          imageUrl: data.secure_url,
          createdAt: new Date().toISOString(),
          adminSecret: "gharanapickles_secure_key_123" // bypassing rules dynamically for test
        });
        console.log("Post saved to Firestore.");
        
        // Reset form
        setFile(null);
        setCaption("");
        setPreview(null);
        alert("Upload successful!");
      }
    } catch (error: any) {
      console.error("Upload error detail:", error);
      alert("Upload error: " + (error.message || "Something went wrong"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8 font-sans">
      <h1 className="text-2xl font-bold">Cloudinary Image Upload</h1>
      
      {/* Upload Form */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Select Image</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-mustard file:text-white hover:file:bg-mustard-dark transition-colors"
          />
        </div>

        {preview && (
          <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
            <img src={preview} alt="Preview" className="max-h-full max-w-full object-contain" />
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Caption</label>
          <input 
            type="text" 
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption..."
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-mustard outline-none"
          />
        </div>

        <button 
          onClick={handleUpload}
          disabled={uploading || !file || !caption.trim()}
          className="w-full bg-mustard hover:bg-mustard-dark text-white font-bold py-2.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "Uploading..." : "Upload Post"}
        </button>
      </div>

      {/* Posts List */}
      <div>
        <h2 className="text-xl font-bold mb-4">Uploaded Posts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {posts.map(post => (
            <div key={post.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
              <img src={post.imageUrl} alt={post.caption} className="w-full aspect-video object-cover bg-gray-50" />
              <div className="p-4">
                <p className="font-medium text-gray-900">{post.caption}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
          
          {posts.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-400">
              No posts found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth, handleFirestoreError, OperationType } from "@/src/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

export default function PostGene() {
  const navigate = useNavigate();
  const [user, setUser] = useState(auth.currentUser);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    symbol: "",
    name: "",
    description: "",
    category: ""
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Card className="max-w-md mx-auto border-[#cccccc]">
          <CardHeader>
            <CardTitle className="text-[#990000]">Access Denied</CardTitle>
            <CardDescription>Please log in to post genetic information to the archive.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="bg-[#990000] hover:bg-[#770000] text-white">
              Return to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const symbol = formData.symbol.trim();
    const name = formData.name.trim();
    const description = formData.description.trim();
    const category = formData.category;

    if (!symbol || !name || !description || !category) {
      setError("All fields are required.");
      return;
    }

    if (description.length < 50) {
      setError("Description must be at least 50 characters long.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "genes"), {
        symbol,
        name,
        description,
        category,
        created_at: serverTimestamp(),
        authorUid: user.uid,
        tags: [category.toLowerCase()]
      });
      setSuccess(true);
      setTimeout(() => navigate("/"), 2000);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, "genes");
      setError("Failed to save gene. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold font-heading">Gene Posted Successfully!</h2>
          <p className="text-gray-500">Redirecting you back to the archive...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button 
        variant="ghost" 
        onClick={() => navigate("/")} 
        className="mb-6 text-gray-500 hover:text-[#990000] p-0 h-auto"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Archive
      </Button>

      <div className="space-y-2 mb-8">
        <h1 className="text-4xl font-heading font-bold text-[#990000]">Post a Gene</h1>
        <p className="text-lg text-gray-600">Share genetic information in clear, simple language.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 border border-[#cccccc] rounded-sm shadow-sm">
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Gene Symbol</label>
          <Input 
            value={formData.symbol}
            onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
            placeholder="e.g. BRCA1"
            className="border-[#cccccc] focus-visible:ring-[#990000]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Gene Name</label>
          <Input 
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Breast Cancer Gene 1"
            className="border-[#cccccc] focus-visible:ring-[#990000]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Category</label>
          <Select onValueChange={(val) => setFormData({ ...formData, category: val })}>
            <SelectTrigger className="border-[#cccccc] focus:ring-[#990000]">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tumor Suppressor">Tumor Suppressor</SelectItem>
              <SelectItem value="Oncogene">Oncogene</SelectItem>
              <SelectItem value="Metabolism">Metabolism</SelectItem>
              <SelectItem value="Transcription Factor">Transcription Factor</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Description</label>
          <Textarea 
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Provide a detailed description of the gene's function and significance (min 50 characters)..."
            className="min-h-[150px] border-[#cccccc] focus-visible:ring-[#990000]"
          />
          <div className="flex justify-between text-[10px] font-mono mt-1">
            <span className={formData.description.length < 50 ? "text-[#990000]" : "text-green-600"}>
              {formData.description.length} / 50 characters minimum
            </span>
          </div>
        </div>

        {error && <p className="text-sm text-[#990000] font-medium">{error}</p>}

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full bg-[#990000] hover:bg-[#770000] text-white font-bold h-12"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Posting to Archive...
            </>
          ) : (
            "Post Gene to Archive"
          )}
        </Button>
      </form>
    </div>
  );
}

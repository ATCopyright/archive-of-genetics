import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { db, handleFirestoreError, OperationType } from "@/src/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Loader2, Calendar, User, Tag, Info } from "lucide-react";
import { motion } from "motion/react";

export default function GeneProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [gene, setGene] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGene = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const docRef = doc(db, "genes", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setGene({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError("Gene profile not found in the archive.");
        }
      } catch (err: any) {
        handleFirestoreError(err, OperationType.GET, `genes/${id}`);
        setError("Failed to load gene profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchGene();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-[#990000] animate-spin" />
        <p className="text-gray-500 font-medium italic">Retrieving genetic data from archive...</p>
      </div>
    );
  }

  if (error || !gene) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-md mx-auto space-y-6">
          <div className="bg-[#f9f9f9] border border-[#cccccc] p-8 rounded-sm">
            <h2 className="text-2xl font-heading font-bold text-[#990000] mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error || "Gene not found."}</p>
            <Button onClick={() => navigate("/")} className="bg-[#990000] hover:bg-[#770000] text-white">
              Return to Archive
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-8 max-w-4xl"
    >
      <Button 
        variant="ghost" 
        onClick={() => navigate("/")} 
        className="mb-8 text-gray-500 hover:text-[#990000] p-0 h-auto flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Archive
      </Button>

      <article className="space-y-8">
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-5xl font-heading font-bold text-[#990000] tracking-tight">
              {gene.symbol}
            </h1>
            {gene.category && (
              <Badge className="bg-[#990000] hover:bg-[#990000] text-white px-3 py-1 text-xs uppercase tracking-widest font-bold border-none">
                {gene.category}
              </Badge>
            )}
          </div>
          <h2 className="text-2xl text-gray-700 font-medium italic border-l-4 border-[#cccccc] pl-4">
            {gene.name}
          </h2>
          
          <div className="flex flex-wrap gap-6 pt-4 text-xs font-mono text-gray-500 uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Archived: {gene.created_at?.toDate ? gene.created_at.toDate().toLocaleDateString() : 'Recently'}</span>
            </div>
            {gene.location && gene.location !== "Unknown" && (
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span>Locus: {gene.location}</span>
              </div>
            )}
          </div>
        </header>

        <Separator className="bg-[#cccccc]" />

        <section className="space-y-6">
          <div className="flex items-center gap-2 text-[#990000]">
            <Info className="w-5 h-5" />
            <h3 className="text-lg font-bold uppercase tracking-widest">Description & Function</h3>
          </div>
          <div className="prose prose-slate max-w-none">
            <p className="text-lg leading-relaxed text-gray-800 whitespace-pre-wrap">
              {gene.description}
            </p>
          </div>
        </section>

        {gene.tags && gene.tags.length > 0 && (
          <section className="space-y-4 pt-8">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Related Tags</h4>
            <div className="flex flex-wrap gap-2">
              {gene.tags.map((tag: string) => (
                <span key={tag} className="ao3-tag text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}

        <footer className="pt-12 mt-12 border-t border-[#eeeeee] text-center">
          <p className="text-xs text-gray-400 italic">
            This entry is part of the open-source Archive of Genetics. 
            Information is provided by community contributors and should be verified with clinical sources.
          </p>
        </footer>
      </article>
    </motion.div>
  );
}

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, handleFirestoreError, OperationType } from "@/src/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Database, Plus } from "lucide-react";
import { motion } from "motion/react";

export default function GeneDatabase() {
  const navigate = useNavigate();
  const [genes, setGenes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "genes"), orderBy("created_at", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setGenes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "genes");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-[#990000] animate-spin" />
        <p className="text-gray-500 font-medium italic">Loading database entries...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#990000] mb-1">
            <Database className="w-6 h-6" />
            <h1 className="text-3xl font-heading font-bold">Gene Database</h1>
          </div>
          <p className="text-gray-600">Browse the complete collection of archived genetic information.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate("/")} 
            className="border-[#cccccc] text-gray-600 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button 
            onClick={() => navigate("/post-gene")} 
            className="bg-[#990000] hover:bg-[#770000] text-white font-bold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Post New Gene
          </Button>
        </div>
      </div>

      <div className="bg-white border border-[#cccccc] rounded-sm shadow-sm overflow-hidden">
        {genes.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <p className="text-gray-500 italic">No genes yet. Be the first to contribute to the archive.</p>
            <Button 
              onClick={() => navigate("/post-gene")} 
              variant="link" 
              className="text-[#990000] font-bold"
            >
              Post a Gene →
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-[#f5f5f5]">
              <TableRow className="hover:bg-transparent border-b border-[#cccccc]">
                <TableHead className="w-[150px] font-bold text-[#2a2a2a] uppercase tracking-wider text-xs">Symbol</TableHead>
                <TableHead className="font-bold text-[#2a2a2a] uppercase tracking-wider text-xs">Name</TableHead>
                <TableHead className="w-[200px] font-bold text-[#2a2a2a] uppercase tracking-wider text-xs">Category</TableHead>
                <TableHead className="w-[150px] font-bold text-[#2a2a2a] uppercase tracking-wider text-xs text-right">Archived Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {genes.map((gene, index) => (
                <TableRow 
                  key={gene.id} 
                  onClick={() => navigate(`/gene/${gene.id}`)}
                  className={`cursor-pointer transition-colors hover:bg-[#990000]/5 border-b border-[#eeeeee] ${index % 2 === 1 ? 'bg-[#fafafa]' : 'bg-white'}`}
                >
                  <TableCell className="font-bold text-[#990000] hover:underline">
                    {gene.symbol}
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">
                    {gene.name}
                  </TableCell>
                  <TableCell>
                    {gene.category && (
                      <Badge variant="outline" className="text-[10px] uppercase font-bold border-[#cccccc] text-gray-600">
                        {gene.category}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-xs font-mono text-gray-500">
                    {gene.created_at?.toDate ? gene.created_at.toDate().toLocaleDateString() : 'Recently'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      
      <div className="mt-6 text-right">
        <p className="text-xs text-gray-400 italic">
          Showing {genes.length} entries in the archive.
        </p>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Gene } from "@/src/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Info, History, BookOpen, Heart, Globe, Code, Github, Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, auth, handleFirestoreError, OperationType } from "@/src/lib/firebase";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where, getDocs } from "firebase/firestore";

export function WelcomeSection() {
  return (
    <div className="bg-[#fdfdfd] border border-[#cccccc] p-6 rounded-sm shadow-sm mb-8">
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="flex-1 space-y-4">
          <h2 className="text-3xl font-heading font-bold text-[#990000]">Welcome to the Archive of Genetics</h2>
          <p className="text-lg leading-relaxed">
            The Archive of Genetics (AOG) is a non-profit, open-source, community-built database dedicated to making genetic information accessible to everyone. 
            Inspired by the principles of open access and collaborative archiving, we believe that the blueprint of life should not be hidden behind paywalls or complex jargon.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-[#990000] hover:bg-[#770000] text-white">Explore the Database</Button>
            <Button variant="outline" className="border-[#990000] text-[#990000] hover:bg-[#990000]/5">Learn About AOG</Button>
          </div>
        </div>
        <div className="w-full md:w-1/3 bg-[#eeeeee] p-4 rounded border border-[#cccccc] space-y-3">
          <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
            <Info className="w-4 h-4 text-[#990000]" />
            Quick Stats
          </h3>
          <ul className="text-sm space-y-2">
            <li className="flex justify-between"><span>Genes Archived:</span> <span className="font-mono font-bold">0</span></li>
            <li className="flex justify-between"><span>Contributors:</span> <span className="font-mono font-bold">0</span></li>
            <li className="flex justify-between"><span>Open Source:</span> <span className="font-mono font-bold">Yes</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export function NewsSection() {
  const [news, setNews] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "news"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, "news"));

    // Check admin status
    if (auth.currentUser) {
      getDocs(query(collection(db, "users"), where("uid", "==", auth.currentUser.uid)))
        .then(snap => {
          if (!snap.empty && snap.docs[0].data().role === 'admin') {
            setIsAdmin(true);
          }
        });
    }

    return () => unsubscribe();
  }, []);

  const postNews = async () => {
    const title = prompt("Enter news title:");
    const summary = prompt("Enter news summary:");
    if (title && summary && auth.currentUser) {
      try {
        await addDoc(collection(db, "news"), {
          title,
          summary,
          date: serverTimestamp(),
          authorUid: auth.currentUser.uid
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, "news");
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b border-[#cccccc] pb-2">
        <h3 className="text-xl font-heading font-bold flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#990000]" />
          News
        </h3>
        {isAdmin && (
          <Button variant="ghost" size="sm" onClick={postNews} className="h-6 px-2 text-[10px] uppercase font-bold">
            <Plus className="w-3 h-3 mr-1" /> Post News
          </Button>
        )}
      </div>
      <div className="space-y-4">
        {news.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No news items yet. The archive is just beginning.</p>
        ) : (
          news.map((item) => (
            <div key={item.id} className="group cursor-pointer">
              <div className="flex justify-between items-baseline">
                <h4 className="font-bold text-[#990000] group-hover:underline">{item.title}</h4>
                <span className="text-xs text-gray-400 font-mono">
                  {item.date?.toDate ? item.date.toDate().toLocaleDateString() : 'Just now'}
                </span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{item.summary}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function GeneSearch() {
  const [queryStr, setQueryStr] = useState("");
  const [results, setResults] = useState<Gene[]>([]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQueryStr(val);
    if (val.trim().length > 1) {
      // In a real app, we'd use Algolia or a more complex Firestore query
      // For now, we'll fetch all and filter client-side (since it's empty/small)
      const q = query(collection(db, "genes"));
      const snap = await getDocs(q);
      const allGenes = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Gene));
      const filtered = allGenes.filter(g => 
        g.symbol.toLowerCase().includes(val.toLowerCase()) || 
        g.name.toLowerCase().includes(val.toLowerCase()) ||
        g.tags?.some(t => t.toLowerCase().includes(val.toLowerCase()))
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <Input 
          value={queryStr}
          onChange={handleSearch}
          placeholder="Search for a gene (e.g., BRCA1, TP53)..." 
          className="h-12 text-lg pl-12 border-[#cccccc] focus-visible:ring-[#990000]"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
      </div>

      <AnimatePresence>
        {results.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-4"
          >
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Search Results ({results.length})</h4>
            {results.map((gene) => (
              <Card key={gene.id} className="border-[#cccccc] hover:border-[#990000] transition-colors cursor-pointer group">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-[#990000] group-hover:underline">{gene.symbol}</CardTitle>
                      <CardDescription className="font-medium text-gray-700">{gene.name}</CardDescription>
                    </div>
                    <Badge variant="outline" className="font-mono text-[10px]">{gene.location}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-gray-600 mb-3">{gene.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {gene.tags?.map(tag => (
                      <span key={tag} className="ao3-tag">{tag}</span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        ) : queryStr.length > 1 ? (
          <p className="text-sm text-gray-500 italic">No genes found matching "{queryStr}".</p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function FeaturedGenes() {
  const [featured, setFeatured] = useState<Gene[]>([]);

  useEffect(() => {
    const q = query(collection(db, "genes"), orderBy("lastUpdated", "desc"), where("symbol", "!=", ""));
    // Note: This query might need an index, but for now we'll just fetch all if it fails or use a simpler one
    const unsubscribe = onSnapshot(collection(db, "genes"), (snapshot) => {
      setFeatured(snapshot.docs.slice(0, 3).map(doc => ({ id: doc.id, ...doc.data() } as Gene)));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-heading font-bold border-b border-[#cccccc] pb-2 flex items-center gap-2">
        <Heart className="w-5 h-5 text-[#990000]" />
        Featured Gene Profiles
      </h3>
      {featured.length === 0 ? (
        <div className="bg-[#f9f9f9] p-8 border border-dashed border-[#cccccc] text-center rounded-sm">
          <p className="text-sm text-gray-500 italic">The database is currently empty. Be the first to contribute!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featured.map((gene) => (
            <Card key={gene.id} className="border-[#cccccc] bg-[#f9f9f9]">
              <CardHeader className="p-4">
                <CardTitle className="text-lg text-[#990000]">{gene.symbol}</CardTitle>
                <CardDescription className="text-xs line-clamp-1">{gene.name}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-xs text-gray-600 line-clamp-3 mb-4">{gene.description}</p>
                <Button variant="link" className="p-0 h-auto text-xs text-[#990000] font-bold">Read Full Profile →</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function AboutAOG() {
  return (
    <div className="space-y-6 bg-[#f5f5f5] p-8 border border-[#cccccc] rounded-sm">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-3xl font-heading font-bold text-[#990000]">Why AOG?</h3>
          <p className="text-gray-500 italic">"Knowledge is the most powerful mutation."</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <h4 className="font-bold flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#990000]" />
              Universal Access
            </h4>
            <p className="text-sm leading-relaxed text-gray-700">
              Genetic information is often locked behind expensive journals or proprietary databases. We believe that since DNA is the shared heritage of humanity, information about it should be freely available to every person on Earth.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold flex items-center gap-2">
              <Code className="w-4 h-4 text-[#990000]" />
              Open Source & Community
            </h4>
            <p className="text-sm leading-relaxed text-gray-700">
              AOG is built on open-source code. We invite developers, geneticists, and enthusiasts to contribute to our codebase and our database. Transparency in how we handle data is our core value.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-[#cccccc] text-center">
          <p className="text-sm font-medium mb-4">Interested in helping us make genetics accessible?</p>
          <Button className="bg-[#333333] hover:bg-black text-white px-8">
            <Github className="w-4 h-4 mr-2" />
            Contribute on GitHub
          </Button>
        </div>
      </div>
    </div>
  );
}

export function HistorySection() {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-heading font-bold border-b border-[#cccccc] pb-2 flex items-center gap-2">
        <History className="w-6 h-6 text-[#990000]" />
        History of Genetics
      </h3>
      <div className="relative border-l-2 border-[#990000] ml-4 pl-8 space-y-12 py-4">
        <div className="relative">
          <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-[#990000] border-4 border-white shadow-sm" />
          <span className="text-xs font-mono font-bold text-[#990000]">1865</span>
          <h4 className="font-bold text-lg">Mendel's Laws of Inheritance</h4>
          <p className="text-sm text-gray-600">Gregor Mendel publishes his work on pea plants, establishing the foundations of modern genetics.</p>
        </div>
        <div className="relative">
          <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-[#990000] border-4 border-white shadow-sm" />
          <span className="text-xs font-mono font-bold text-[#990000]">1953</span>
          <h4 className="font-bold text-lg">The Double Helix</h4>
          <p className="text-sm text-gray-600">Watson, Crick, and Franklin discover the structure of DNA, revealing how genetic information is stored and copied.</p>
        </div>
        <div className="relative">
          <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-[#990000] border-4 border-white shadow-sm" />
          <span className="text-xs font-mono font-bold text-[#990000]">2003</span>
          <h4 className="font-bold text-lg">Human Genome Project Completion</h4>
          <p className="text-sm text-gray-600">The first complete mapping of the human genome is finished, opening a new era of biological research.</p>
        </div>
      </div>
      <Button variant="link" className="p-0 h-auto text-sm text-[#990000] font-bold">Explore the Full Timeline →</Button>
    </div>
  );
}

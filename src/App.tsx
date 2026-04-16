import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import PostGene from "./pages/PostGene";
import GeneProfile from "./pages/GeneProfile";
import GeneDatabase from "./pages/GeneDatabase";
import { 
  WelcomeSection, 
  NewsSection, 
  GeneSearch, 
  FeaturedGenes, 
  AboutAOG, 
  HistorySection 
} from "./components/HomeSections";
import { Separator } from "@/components/ui/separator";
import { auth, db } from "./lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDocFromServer } from "firebase/firestore";

function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <WelcomeSection />

      {/* Search and News Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <section id="search">
            <h3 className="text-2xl font-heading font-bold mb-6 text-[#990000]">Find a Gene</h3>
            <GeneSearch />
          </section>
          
          <Separator className="bg-[#cccccc]" />
          
          <section id="featured">
            <FeaturedGenes />
          </section>
        </div>
        
        <aside className="space-y-8">
          <NewsSection />
          <div className="bg-[#f9f9f9] p-4 border border-[#cccccc] rounded-sm">
            <h4 className="font-bold text-sm uppercase tracking-wider mb-3">Contribute</h4>
            <p className="text-xs text-gray-600 mb-4">
              Help us expand the archive! We are looking for volunteers to help with data entry, coding, and scientific review.
            </p>
            <a href="#" className="ao3-link text-xs font-bold">Learn more about volunteering →</a>
          </div>
        </aside>
      </div>

      <Separator className="bg-[#cccccc]" />

      {/* About and History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <section id="history">
          <HistorySection />
        </section>
        <section id="about">
          <AboutAOG />
        </section>
      </div>

      {/* Accessibility Statement */}
      <section className="bg-[#333333] text-white p-8 rounded-sm text-center space-y-4">
        <h3 className="text-2xl font-heading font-bold">Our Commitment to Accessibility</h3>
        <p className="max-w-2xl mx-auto text-gray-300 leading-relaxed">
          We believe that genetics is not just for scientists in labs. It is the story of every human being. 
          AOG is committed to making this information accessible through clear language, open data standards, 
          and a design that works for everyone.
        </p>
        <div className="flex justify-center gap-4 pt-2">
          <span className="text-xs bg-white/10 px-3 py-1 rounded-full border border-white/20">W3C Compliant</span>
          <span className="text-xs bg-white/10 px-3 py-1 rounded-full border border-white/20">Open Data</span>
          <span className="text-xs bg-white/10 px-3 py-1 rounded-full border border-white/20">Community Driven</span>
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      setIsAuthReady(true);
    });

    // Test connection to Firestore
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        console.log("Firestore connection successful.");
      } catch (error) {
        console.error("Firestore connection test failed:", error);
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. This often means the database hasn't been created in the console or the ID is incorrect.");
        }
      }
    };
    testConnection();

    return () => unsubscribe();
  }, []);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <div className="text-[#990000] font-heading text-2xl animate-pulse">
          Loading Archive...
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/genes" element={<GeneDatabase />} />
          <Route path="/post-gene" element={<PostGene />} />
          <Route path="/gene/:id" element={<GeneProfile />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

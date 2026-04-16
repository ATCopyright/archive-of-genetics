import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, User, BookOpen, History, Info, Github, LogOut, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth, login, logout, signUp } from "@/src/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState(auth.currentUser);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await login(email, password);
      }
      setShowAuthModal(false);
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-[#2a2a2a]">
      {/* AO3 Style Header */}
      <header className="ao3-header">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link to="/">
              <h1 className="text-[26px] font-bold tracking-normal flex items-center gap-2 font-logo text-white">
                <span>Archive of Genetics</span>
              </h1>
            </Link>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative hidden sm:block">
              <Input 
                placeholder="Search genes..." 
                className="bg-white text-black h-8 w-48 lg:w-64 pl-8 text-xs border-none focus-visible:ring-0"
              />
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium hidden lg:inline text-white">{user.email}</span>
                <Button variant="ghost" size="sm" onClick={logout} className="text-white hover:bg-white/10 h-8 px-2">
                  <LogOut className="w-4 h-4 mr-1" />
                  Log Out
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setShowAuthModal(true)} className="text-white hover:bg-white/10 h-8 px-2">
                <User className="w-4 h-4 mr-1" />
                Log In
              </Button>
            )}
            <Button variant="ghost" size="icon" className="md:hidden text-white">
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-sm w-full max-w-md p-6 relative shadow-xl border border-[#cccccc]">
            <button onClick={() => setShowAuthModal(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-heading font-bold text-[#990000] mb-6">
              {isSignUp ? "Create Account" : "Log In"}
            </h2>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Email</label>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="border-[#cccccc] focus-visible:ring-[#990000]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Password</label>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="border-[#cccccc] focus-visible:ring-[#990000]"
                />
              </div>
              {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
              <Button type="submit" className="w-full bg-[#990000] hover:bg-[#770000] text-white font-bold">
                {isSignUp ? "Sign Up" : "Log In"}
              </Button>
            </form>
            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <button 
                onClick={() => setIsSignUp(!isSignUp)} 
                className="text-xs text-[#990000] font-bold hover:underline"
              >
                {isSignUp ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-header / Breadcrumbs */}
      <div className="ao3-sub-header py-1 text-xs">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-bold">Hi, {user ? user.email?.split('@')[0] : 'Guest'}!</span>
            <span className="text-gray-400">|</span>
            <nav className="flex items-center space-x-2">
              <Link to="/genes" className="ao3-link">Browse</Link>
              <span className="text-gray-400">|</span>
              <a href="#" className="ao3-link">Search</a>
              <span className="text-gray-400">|</span>
              <a href="#" className="ao3-link">About</a>
              {user && (
                <>
                  <span className="text-gray-400">|</span>
                  <Link to="/post-gene" className="ao3-link">Post New</Link>
                  <span className="text-gray-400">|</span>
                  <a href="#" className="ao3-link">Drafts</a>
                </>
              )}
            </nav>
          </div>
          <div className="hidden sm:flex items-center space-x-4">
            <span className="text-gray-500 italic">"For genetics, open to everyone."</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#eeeeee] border-t border-[#cccccc] py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-lg text-[#990000]">Archive of Genetics</h3>
              <p className="text-sm text-gray-600">
                A non-profit, open-source archive for genetic information and history.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-500 hover:text-[#990000]"><Github className="w-5 h-5" /></a>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 uppercase tracking-wider">About</h4>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="ao3-link">About AOG</a></li>
                <li><a href="#" className="ao3-link">History of Genetics</a></li>
                <li><a href="#" className="ao3-link">Accessibility Mission</a></li>
                <li><a href="#" className="ao3-link">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 uppercase tracking-wider">Contribute</h4>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="ao3-link">How to Contribute</a></li>
                <li><a href="#" className="ao3-link">Open Source Code</a></li>
                <li><a href="#" className="ao3-link">Volunteer</a></li>
                <li><a href="#" className="ao3-link">Donate</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 uppercase tracking-wider">Support</h4>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="ao3-link">Help & FAQ</a></li>
                <li><a href="#" className="ao3-link">Contact Us</a></li>
                <li><a href="#" className="ao3-link">Site Map</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-300 text-center text-xs text-gray-500">
            <p>© 2026 Archive of Genetics. All rights reserved. Built with passion for science.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { WarpBackground } from '@/components/magicui/warp-background';
import { ClientOnly } from '@/components/ClientOnly';
import { CheckCircle, Zap, Brain, Truck, BarChart2 } from 'lucide-react';
import { AuroraText } from '@/components/magicui/aurora-text';

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 w-full flex items-center justify-between px-6 md:px-16 py-6 bg-white-900 text-stone-900 z-30 backdrop-blur-lg border border-stone-200">
        <div className="flex items-center gap-2">
          <span className="font-bold text-2xl tracking-wide">logo hir</span>
        </div>
        <nav className="flex gap-6 font-medium">
          <Link href="/" className="hover:text-blue-700 transition">Dashboard</Link>
          <a href="#features" className="hover:text-blue-700 transition">Features</a>
          <a href="mailto:info@agos.com" className="hover:text-blue-700 transition">Contact</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative flex flex-col items-start justify-center h-[70vh] bg-white text-left overflow-hidden pb-8 px-6 md:px-16">
        <div className="relative z-10 flex flex-col items-start max-w-2xl mx-auto md:mx-0">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-2">
            <span className="text-stone-900">Welcome to </span>
            <AuroraText>AGOS</AuroraText>
          </h1>
          <p className="text-base md:text-lg font-light text-blue-700 mb-6">
            Tagline
          </p>
          <p className="text-base md:text-lg text-gray-600 mb-8 max-w-xl">
            AGOS is a next-generation platform for real-time water shortage monitoring, AI-powered predictions, and optimized emergency response for Metro Manila.
          </p>
          <Link
            href="/dashboard"
            className="inline-block rounded-lg bg-stone-900 px-8 py-3 text-lg  font-semibold text-white shadow-lg transition hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 flex items-center justify-center bg-background">
        <ClientOnly>
          <WarpBackground className="absolute inset-0 z-0">
            <></>
          </WarpBackground>
        </ClientOnly>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-10 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-700 bg-clip-text text-transparent outline-4 outline-offset-2 outline-white">
            What Do We Offer?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col items-center p-6 bg-white/100 dark:bg-black/30 rounded-xl border border-1 border-blue-100 hover:shadow-lg transition-all duration-300">
              <Zap className="h-10 w-10 text-blue-500 mb-3" />
              <h3 className="text-xl font-semibold mb-2">Real-time Monitoring</h3>
              <p className="text-gray-600">Live updates on water supply and shortage status across all barangays.</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-white/100 dark:bg-black/30 rounded-xl border border-1 border-blue-100 hover:shadow-lg transition-all duration-300">
              <Brain className="h-10 w-10 text-blue-500 mb-3" />
              <h3 className="text-xl font-semibold mb-2">AI-powered Prediction</h3>
              <p className="text-gray-600">Advanced algorithms forecast shortages and help you plan ahead.</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-white/100 dark:bg-black/30 rounded-xl border border-1 border-blue-100 hover:shadow-lg transition-all duration-300">
              <Truck className="h-10 w-10 text-blue-500 mb-3" />
              <h3 className="text-xl font-semibold mb-2">Optimized Allocation</h3>
              <p className="text-gray-600">Smart distribution of emergency water resources for maximum impact.</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-white/100 dark:bg-black/30 rounded-xl border border-1 border-blue-100 hover:shadow-lg transition-all duration-300">
              <BarChart2 className="h-10 w-10 text-blue-500 mb-3" />
              <h3 className="text-xl font-semibold mb-2">Data-driven Insights</h3>
              <p className="text-gray-600">Visual analytics and reports to support your decisions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 w-full bg-stone-900 text-white py-8 mt-auto shadow-inner">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-6">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <span className="font-bold text-blue-100 text-lg tracking-wide">AGOS</span>
          </div>
          <div className="text-sm text-blue-100">&copy; {new Date().getFullYear()} BSCS 2-4. All rights reserved.</div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="/" className="hover:underline text-blue-200">Dashboard</Link>
            <a href="https://github.com/icyclestick/AGOS?fbclid=IwY2xjawLHL6lleHRuA2FlbQIxMQABHkeQBhEQ4Lqs0wV9U0gCJkmH74AEoH5u8_FnrblciHutvMFgcK6W8MVSDqdN_aem_k2NMiXUO3RvMiFqQmOf6uw" target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-200">GitHub</a>
            <a href="mailto:info@agos.com" className="hover:underline text-blue-200">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
} 
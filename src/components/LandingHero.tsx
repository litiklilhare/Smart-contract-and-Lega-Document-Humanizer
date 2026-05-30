import React from "react";
import { ShieldCheck, FileText, Code2, AlertTriangle, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface LandingHeroProps {
  onGetStarted: () => void;
}

export default function LandingHero({ onGetStarted }: LandingHeroProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="relative overflow-hidden bg-slate-900 text-white min-h-[90vh] flex items-center">
      {/* Decorative background grid and gradients */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-40 right-20 w-[300px] h-[300px] bg-violet-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-20 relative z-10 w-full">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6 uppercase tracking-wider"
            variants={itemVariants}
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
            Empowering Decision Makers
          </motion.div>

          {/* Heading */}
          <motion.h1
            className="text-4xl md:text-6xl font-black tracking-tight mb-6 bg-gradient-to-r from-slate-100 via-indigo-100 to-indigo-300 bg-clip-text text-transparent"
            variants={itemVariants}
          >
            Smart Contracts & Legalese, <br className="hidden md:inline" />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-300 bg-clip-text text-transparent">
              Humanized Instantly.
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            className="text-lg text-slate-400 mb-10 leading-relaxed font-sans"
            variants={itemVariants}
          >
            Read the fine print. Skip the legal gymnastics. Our advanced AI decompiles Solidity/Rust smart contracts and complex legal agreements into plain, fully transparent English with instant risk assessment.
          </motion.p>

          {/* Call to Action */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            variants={itemVariants}
          >
            <button
              onClick={onGetStarted}
              id="btn-get-started"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 text-base"
            >
              Analyze Document Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1" />
            </button>
            <a
              href="#key-features"
              className="w-full sm:w-auto px-6 py-4 bg-slate-800/60 hover:bg-slate-800 text-slate-300 font-medium rounded-xl border border-slate-700/50 hover:text-white transition-all duration-200 text-center"
            >
              Explore Features
            </a>
          </motion.div>
        </motion.div>

        {/* Feature Bento Grid */}
        <div id="key-features" className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
          <motion.div
            className="p-8 rounded-2xl bg-slate-800/40 border border-slate-700/30 backdrop-blur-sm shadow-xl hover:border-indigo-500/30 hover:bg-slate-800/60 transition-all duration-300 group"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6 border border-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-100 group-hover:text-indigo-300 transition-colors">
              Plain English Translation
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Our AI extracts legal jargon, complex terminology, or code specifications and translates them into a highly intuitive, step-by-step human breakdown.
            </p>
          </motion.div>

          <motion.div
            className="p-8 rounded-2xl bg-slate-800/40 border border-slate-700/30 backdrop-blur-sm shadow-xl hover:border-indigo-500/30 hover:bg-slate-800/60 transition-all duration-300 group"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center mb-6 border border-yellow-500/20 text-yellow-400 group-hover:bg-yellow-500 group-hover:text-white transition-colors duration-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-100 group-hover:text-yellow-300 transition-colors">
              Legality & Risk Assessment
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Instantly retrieve an automated, reliable Compliance Fairness Score (0-100) determining the safety, centralization level, or regulatory positioning of the contract contents.
            </p>
          </motion.div>

          <motion.div
            className="p-8 rounded-2xl bg-slate-800/40 border border-slate-700/30 backdrop-blur-sm shadow-xl hover:border-indigo-500/30 hover:bg-slate-800/60 transition-all duration-300 group"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-6 border border-red-500/20 text-red-400 group-hover:bg-red-500 group-hover:text-white transition-colors duration-300">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-100 group-hover:text-red-300 transition-colors">
              Red Flag & Anomaly Spotting
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Expose hidden clauses, unreasonable lockups, liquidation risks, excessive fees, or centralized backdoors. If it shouldn't be there, we highlight it instantly.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

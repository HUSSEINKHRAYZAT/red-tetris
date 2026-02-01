import React from 'react';
import { motion } from 'framer-motion';
import { User, Users } from 'lucide-react';

export default function ActionSection() {
  return (
    <section className="w-full pb-24 px-4 md:px-8 max-w-6xl mx-auto">
      <motion.div
        className="bg-black border-4 border-double border-primary/30 p-8 rounded-xl relative overflow-hidden shadow-2xl"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false }}
        transition={{ duration: 0.7 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50"></div>
        <h2 className="relative z-10 text-4xl md:text-6xl font-display text-white text-center mb-12 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          Ready to Drop?
        </h2>

        <div className="relative z-10 flex flex-col md:flex-row justify-center items-stretch gap-8 max-w-4xl mx-auto">
          {/* Singleplayer Button */}
          <button className="flex-1 group relative overflow-hidden bg-gray-800 rounded-lg p-8 border-2 border-gray-600 hover:border-primary transition-all duration-300 text-left md:text-center cursor-pointer">
            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300"></div>
            <div className="relative z-10 flex flex-col items-center">
              <User className="w-16 h-16 text-gray-500 group-hover:text-primary transition-colors duration-300 mb-4" />
              <h3 className="text-2xl font-mono text-white group-hover:text-primary transition-colors font-bold uppercase tracking-widest">Singleplayer</h3>
              <p className="text-sm text-gray-400 mt-2 font-mono group-hover:text-gray-200">Practice your stacking skills</p>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/20 blur-xl rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          </button>

          {/* Multiplayer Button */}
          <button className="flex-1 group relative overflow-hidden bg-primary rounded-lg p-8 border-2 border-red-400 shadow-[0_0_15px_rgba(255,26,26,0.5)] hover:shadow-[0_0_25px_rgba(255,26,26,0.8)] transition-all duration-300 transform hover:-translate-y-1 text-left md:text-center cursor-pointer">
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300"></div>
            <div className="relative z-10 flex flex-col items-center">
              <Users className="w-16 h-16 text-white mb-4 animate-pulse" />
              <h3 className="text-2xl font-mono text-white font-bold uppercase tracking-widest drop-shadow-md">Multiplayer</h3>
              <p className="text-sm text-white/80 mt-2 font-mono font-bold">Challenge the world</p>
            </div>
            {/* Shine effect simulation */}
            <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 group-hover:animate-shine"></div>
            <style>{`
              @keyframes shine {
                0% { left: -100%; }
                100% { left: 200%; }
              }
              .group-hover\\:animate-shine:hover {
                animation: shine 1s;
              }
            `}</style>
          </button>
        </div>
      </motion.div>
    </section>
  );
}

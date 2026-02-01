import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function AboutSection() {
  return (
    <section className="w-full py-32 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-red-900 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-[#120505] border-2 border-primary/20 p-12 md:p-16 rounded-lg shadow-xl overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none overflow-hidden">
            <svg
              className="text-primary transform -rotate-6 scale-150"
              fill="currentColor"
              height="100%"
              viewBox="0 0 400 400"
              width="100%"
            >
              <rect height="40" width="40" x="50" y="50"></rect>
              <rect height="40" width="40" x="90" y="50"></rect>
              <rect height="40" width="40" x="130" y="50"></rect>
              <rect height="40" width="40" x="90" y="90"></rect>
              <rect height="40" width="40" x="300" y="200"></rect>
              <rect height="40" width="40" x="300" y="240"></rect>
              <rect height="40" width="40" x="340" y="240"></rect>
              <rect height="40" width="40" x="340" y="280"></rect>
            </svg>
          </div>

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6 }}
            >
              <h2
                className="text-5xl md:text-6xl font-display text-primary mb-8 drop-shadow-sm jumbotron__title"
                style={{ fontSize: "3.5rem" }}
              >
                About the Project
              </h2>
              <div className="font-mono space-y-6 text-gray-300 text-xl leading-relaxed text-left md:text-center">
                <p>
                  Red Tetris is a modern, networked multiplayer Tetris
                  experience built entirely with JavaScript. This project
                  reimagines the classic puzzle game for the web era,
                  transforming solitary block-stacking into a competitive,
                  real-time battle. Unlike traditional Tetris, here you play
                  against others in shared rooms where every line cleared sends
                  indestructible penalties to opponents. Each player receives
                  identical piece sequences, turning victory into a test of
                  skill, strategy, and speed rather than random chance.
                </p>
                <p>
                  Developed as a full-stack JavaScript implementation, Red
                  Tetris showcases cutting-edge web technologies through
                  functional programming, reactive UI design, and real-time
                  communication via WebSockets. It represents both a technical
                  demonstration and a tribute to the timeless appeal of
                  Tetris—now enhanced for multiplayer competition. Whether
                  practicing alone or battling friends, Red Tetris brings people
                  together through shared challenge and classic gameplay,
                  proving that some games only get better when you're not
                  playing alone.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

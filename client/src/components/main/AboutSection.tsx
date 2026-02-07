
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { ABOUT_SECTION } from "../../lib/static";

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
                {ABOUT_SECTION.TITLE}
              </h2>
              <div className="font-mono space-y-6 text-gray-300 text-xl leading-relaxed text-left md:text-center">
                {ABOUT_SECTION.PARAGRAPHS.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

import React from "react";
import { motion } from "framer-motion";
import { TEAM_SECTION } from "../lib/static";

export default function TeamSection() {
  return (
    <section className="w-full py-24 px-4 md:px-8 max-w-7xl mx-auto">
      <motion.h2
        className="text-5xl md:text-6xl font-display text-primary mb-16 text-center text-glow"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.6 }}
        style={{
          textShadow:
            "0 0 10px rgba(255, 26, 26, 0.7), 0 0 20px rgba(255, 26, 26, 0.5)",
        }}
      >
        {TEAM_SECTION.TITLE}
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
        {TEAM_SECTION.MEMBERS.map((member, index) => (
          <motion.div
            key={index}
            className="group bg-[#0f0f0f] border-l-4 border-primary p-8 shadow-lg hover:shadow-[0_0_15px_rgba(255,26,26,0.5)] transition-all duration-300 transform rounded-r-lg"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ translateY: -4 }}
          >
            <div className="flex items-center space-x-6">
              <div>
                <h3 className="font-display text-3xl text-white">
                  {member.name}
                </h3>
                <p className="font-mono text-primary text-base uppercase tracking-wide mt-1">
                  {member.role}
                </p>
                <a
                  href={member.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block font-mono text-[#7CFF9E] hover:underline"
                >
                  {TEAM_SECTION.GITHUB_LINK_TEXT}
                </a>
              </div>
            </div>
            <p className="mt-6 font-sans text-gray-400 text-base leading-relaxed">
              {member.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

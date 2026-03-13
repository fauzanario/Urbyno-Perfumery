"use client";
import { useState } from "react";

export default function AboutUs() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="bg-white pt-24 pb-8 px-6 overflow-hidden">
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        
        <div className="mb-4">
          <span className="text-7xl tracking-[0.05em] font-serif uppercase">Urbyno</span>
        </div>

        {/* SUBTITLE */}
        <p className="text-sm md:text-base font-medium tracking-widest text-amber-500 uppercase mb-10">
          Born in 2024, Crafted for the World.
        </p>

        {/* MAIN TEXT */}
        <div className="space-y-6 text-gray-600 leading-relaxed tracking-wide text-sm md:text-base font-light">
          <p>
            Founded in 2024, Urbyno Perfumery was conceived from a profound conviction: that every individual deserves a fragrance
            that embodies the essence of their true identity. We exist to redefine the meaning of luxury—through an intimate and
            exquisitely curated collection of scents crafted for the discerning few. Employing the finest extraction techniques and the
            most precious ingredients sourced from around the globe, each bottle of Urbyno is a masterpiece of precision and artistry.
          </p>

          {/* HIDDEN TEXT (TOGGLE) */}
          <div className={`space-y-6 transition-all duration-800 ease-in-out overflow-hidden ${isExpanded ? "max-h-250 opacity-100" : "max-h-0 opacity-0"}`}>
            <p>
              To us, perfume is not merely an adornment, but an invisible signature—an emotional narrative captured in every luminous drop.
              It is presence without proclamation, elegance without excess.
            </p>
            <p className="italic font-serif text-lg text-gray-800 py-4 border-y border-gray-300">
              "Every Scent Is An Unspoken Story"
            </p>
            <p>
              Rooted in innovation and elevated by timeless sophistication, Urbyno is devoted to accompanying every step of your
              journey—transforming fleeting moments into enduring memories, delicately preserved through the power of scent.
            </p>
          </div>
        </div>

        {/* BUTTON TOGGLE */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-6 text-xs font-bold uppercase tracking-[0.3em] text-gray-600 border-b border-gray-600 pb-1 hover:text-amber-500 hover:border-amber-500 transition-all duration-300"
        >
          {isExpanded ? "See Less" : "See More"}
        </button>

      </div>
    </section>
  );
}
"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Tag } from "lucide-react";

export default function Carousel({ sections }: { sections: any[] }) {
  const [current, setCurrent] = useState(0);
  const sales = sections.filter(s => s.type.toUpperCase() === "CAROUSEL");

  useEffect(() => {
    if (sales.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % sales.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [sales.length]);

  if (sales.length === 0) return null;

  const prevSlide = () => setCurrent(current === 0 ? sales.length - 1 : current - 1);
  const nextSlide = () => setCurrent((current + 1) % sales.length);

  return (
    <section className="bg-white py-12 px-6">
      <div className="max-w-5xl mx-auto relative group overflow-hidden rounded-lg bg-black border border-zinc-800 shadow-2xl">
        
        {/* SLIDE TRACK - Animasi Slide Bergeser */}
        <div 
          className="flex transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]" 
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {sales.map((slide) => (
            <div
              key={slide.id}
              className="min-w-full flex flex-col items-center justify-center text-center p-10 md:p-16 min-h-12.5 md:h-100"
            >
              <div className="flex items-center gap-2 mb-6">
                <Tag className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-500">Limited Offer</span>
              </div>
              
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-widest text-white mb-6 leading-tight">
                {slide.title}
              </h2>
              
              {/* Dashed Box - Disesuaikan agar tidak sempit di mobile */}
              <div className="w-full max-w-lg border border-dashed border-amber-500/40 px-4 py-4 md:px-8 md:py-4 rounded-md mb-8">
                <p className="text-sm md:text-base font-medium tracking-widest text-gray-300">
                  {slide.subtitle}
                </p>
              </div>

              {slide.ctaText && (
                <a
                  href={slide.ctaLink || "#"}
                  className="relative text-[11px] font-bold uppercase tracking-[0.3em] text-white group/btn mb-8 lg:mb-0"
                >
                  <span className="relative z-10">{slide.ctaText}</span>
                  <div className="absolute -bottom-2 left-0 w-full h-px bg-amber-500 transition-all duration-300 group-hover/btn:h-px" />
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Tombol Navigasi */}
        {sales.length > 1 && (
          <>
            <button onClick={prevSlide} className="absolute left-0 md:left-4 top-1/2 -translate-y-1/2 z-20 p-2 text-white/30 hover:text-white transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button onClick={nextSlide} className="absolute right-0 md:right-4 top-1/2 -translate-y-1/2 z-20 p-2 text-white/30 hover:text-white transition-colors">
              <ChevronRight className="w-6 h-6" />
            </button>
            
            {/* Indikator Dots */}
            <div className="absolute bottom-8 flex gap-2 w-full justify-center">
              {sales.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrent(i)}
                  className={`h-1 transition-all duration-500 ${i === current ? "w-8 bg-amber-500" : "w-2 bg-zinc-700"}`} 
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
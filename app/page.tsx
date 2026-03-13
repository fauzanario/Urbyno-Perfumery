import { LandingSection } from "./generated/prisma";
import Carousel from "@/components/Carousel";
import AboutUs from "@/components/AboutUs";

type LandingResp = {
  id: string;
  key: string;
  title?: string | null;
  updatedAt: string;
  sections: LandingSection[]; // Sekarang ini akan otomatis punya isActive
};

async function getLanding(): Promise<LandingResp> {
  // server component: fetch internal route
  const res = await fetch(`${process.env.APP_BASE_URL ?? "http://localhost:3000"}/api/landing/home`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch landing");
  return res.json();
}

function Hero({ section }: { section: any }) {
  return (
    <section className="relative h-[61vh] lg:h-[71vh] w-full flex items-center justify-center overflow-hidden bg-black text-white">
      
      {/* 1. Background Image - Full Width & Height */}
      <div className="absolute inset-0 z-0">
        <img
          src={section.imageUrl || "/images/hero-2.jpg"}
          alt="Hero Background"
          className="w-full h-full object-cover opacity-60" // Opacity agar teks menonjol ala Oxva
        />
      </div>

      {/* 2. Content Overlay - Text */}
      <div className="relative z-10 container mx-auto px-6 text-start">
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-normal leading-14 animate-fade-in">
          {section.title}
        </h1>
        <p className="mt-2 text-lg font-light">
          {section.subtitle}
        </p>
        <a
          href={section.ctaLink || "/products"}
          className="inline-block mt-2 text-sm hover:text-gray-300"
        >
          {section.ctaText || "Learn More >"}
        </a>
      </div>
    </section>
  );
}

function PromoGrid({ sections }: { sections: any[] }) {
  const promos = sections.filter(s =>
    s.type.toUpperCase().includes("PROMO")
  );

  if (promos.length === 0) return null;

  return (
    <section className="w-full bg-white">
      {/* Container Full Width tanpa Gap agar gambar menempel satu sama lain */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-3 pt-4 lg:py-3 overflow-hidden">

        {promos.slice(0, 2).map((p) => (
          <div
            key={p.id}
            className="relative h-[61vh] lg:h-100 w-full group overflow-hidden border-b md:border-b-0 md:border-r border-gray-100 last:border-0"
          >
            {/* Background Image - Menutup seluruh area card */}
            {p.imageUrl && (
              <img
                src={p.imageUrl}
                alt={p.title}
                className="absolute inset-0 w-full h-full object-cover 
                          lg:transition-transform lg:duration-300 lg:transform-gpu 
                          lg:ease-[cubic-bezier(0.66,1,0.99,1)] 
                          lg:group-hover:scale-110"
              />
            )}

            {/* Content Overlay - Teks berada di atas gambar, posisi tengah/atas */}
            <div className="relative z-10 h-full w-full flex flex-col items-center justify-start pt-20 px-10 text-center bg-black/20 group-hover:bg-black/10">
              <h3 className="text-3xl md:text-4xl font-black uppercase tracking-[0.15em] text-white drop-shadow-md">
                {p.title}
              </h3>
              <p className="mt-4 text-sm md:text-base font-medium tracking-widest text-gray-200 opacity-90 uppercase">
                {p.subtitle}
              </p>
              <a
                href={p.ctaLink || "/products"}
                className="mt-6 text-xs font-bold text-white uppercase tracking-[0.3em] border-b-2 border-white pb-1 hover:text-amber-500 hover:border-amber-500 transition-all duration-300"
              >
                Learn More {">"}
              </a>
            </div>
          </div>
        ))}

      </div>
    </section>
  );
}

function VideoSection({ sections }: { sections: LandingSection[] }) {
  const videoContent = sections.find(s => s.type.toUpperCase() === "VIDEO");

  if (!videoContent) return null;

  return (
    <section className="relative h-[70vh] mt-4 md:h-[85vh] md:mt-0 w-full flex items-center justify-center overflow-hidden bg-black text-white">
      {/* BACKGROUND VIDEO */}
      <div className="absolute inset-0 z-0">
        <video
          src={videoContent.imageUrl || ""} 
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-70"
        />
        {/* Overlay agar teks tetap terbaca ala Oxva */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* CONTENT OVERLAY */}
      <div className="relative z-10 text-center px-6">
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-widest drop-shadow-lg">
          {videoContent.title}
        </h2>
        <p className="mt-4 text-sm md:text-lg font-light tracking-[0.2em] text-gray-200 uppercase">
          {videoContent.subtitle}
        </p>
        {videoContent.ctaText && (
          <a
            href={videoContent.ctaLink || "#"}
            className="inline-block mt-8 border border-white px-8 py-3 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-300"
          >
            {videoContent.ctaText}
          </a>
        )}
      </div>
    </section>
  );
}

// import AboutUs from "@/components/AboutUs";
// import SaleCarousel from "@/components/Carousel";

// export default async function HomePage() {
//   const landing = await getLanding();
//   const sorted = [...landing.sections].sort((a, b) => a.position - b.position);

//   const hero = sorted.find((s) => s.type.toUpperCase() === "HERO") ?? sorted[0];

//   return (
//     <main>
//       {hero ? <Hero section={hero} /> : null}
//       <PromoGrid sections={sorted} />
//       <VideoSection sections={sorted} />
//       <AboutUs />
//       <SaleCarousel sections={sorted} />
//     </main>
//   );
// }

export default async function HomePage() {
  const landing = await getLanding();
  
  // 1. SEMENTARA KITA MATIKAN FILTER isActive UNTUK PEMBUKTIAN
  const sorted = [...(landing.sections || [])]
    .filter((s) => s.isActive)
    .sort((a, b) => a.position - b.position);

  // 2. Set untuk mencegah render ganda komponen multi-item (Promo & Carousel)
  const renderedTypes = new Set<string>();

  return (
    <main className="min-h-screen bg-black">
      
      {/* 🔴 INDIKATOR DEBUGGING JIKA DATA KOSONG 🔴 */}
      {sorted.length === 0 && (
        <div className="flex items-center justify-center h-64 text-amber-500 text-xl font-bold border border-red-500 m-10">
          DATA SECTIONS KOSONG! (Berarti API tidak mengirimkan array dengan benar)
        </div>
      )}

      {sorted.map((section) => {
        const type = section.type.toUpperCase();

        // Mencegah duplikasi render untuk PromoGrid & Carousel
        if (renderedTypes.has(type) && (type === "PROMO_GRID" || type === "CAROUSEL")) {
            return null;
        }
        renderedTypes.add(type);

        switch (type) {
          case "HERO":
            return <Hero key={section.id} section={section} />;
          case "PROMO_GRID":
            return <PromoGrid key={section.id} sections={sorted} />; 
          case "VIDEO":
            return <VideoSection key={section.id} sections={sorted} />;
          case "CAROUSEL":
            return <Carousel key={section.id} sections={sorted} />;
          case "ABOUT_US":
            return <AboutUs key={section.id} />;
          default:
            return null;
        }
      })}
    </main>
  );
}
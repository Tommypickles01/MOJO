import { motion } from "motion/react";

export default function Lore({ onBack }: { onBack: () => void }) {
  // Using raw GitHub link for high-performance loading
  const loreImageUrl = "https://raw.githubusercontent.com/Tommypickles01/MOJO/refs/heads/main/IMG_5612.png";

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-40 bg-black"
    >
      <img 
        src={loreImageUrl} 
        alt="Mojo Lore" 
        referrerPolicy="no-referrer"
        className="w-full h-full object-contain"
      />
      
      {/* Back Button Overlay */}
      <div className="absolute inset-0 z-50 flex items-end justify-center pb-20 pointer-events-none">
        <button 
          onClick={onBack}
          className="liquid-glass rounded-full px-12 py-4 text-base text-white hover:scale-[1.03] transition-transform cursor-pointer pointer-events-auto shadow-2xl backdrop-blur-md border border-white/20"
        >
          Back to Home
        </button>
      </div>
    </motion.section>
  );
}


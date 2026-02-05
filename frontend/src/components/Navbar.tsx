"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, MessageSquare, Sparkles } from 'lucide-react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';

export const Navbar = () => {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    setHidden(latest > previous && latest > 150);
  });

  const navItems = [
    { name: 'Chat', href: '/', icon: <MessageSquare className="w-4 h-4" /> },
    { name: 'Experiencia', href: '/experiencia', icon: <Briefcase className="w-4 h-4" /> },
    { name: 'Analizador', href: '/analizador', icon: <Sparkles className="w-4 h-4" /> },
  ];

  return (
    <motion.nav 
      variants={{ visible: { y: 0 }, hidden: { y: "-150%" } }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="nav-wrapper"
    >
      <div className="nav-container">
        <Link href="/" className="flex items-center gap-2">
          <div className="nav-logo-box">JM</div>
          <span className="font-semibold text-slate-100 hidden xs:block">Career Agent</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${isActive ? 'text-white' : ''}`}
              >
                {/* Indicador Deslizante */}
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute inset-0 bg-white/10 border border-white/10 rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                {item.icon}
                <span className="hidden sm:block">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
};
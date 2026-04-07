import { useState, useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";

const DEFAULT_MESSAGES = [
  "Welcome to Funoun/فنون 🌸",
  "Every piece is made with love💛",
  "Handcrafted just for you ✨",
  "Explore our collection! 🛍️",
  "Explore Different Stores!🛍️",
  "Each order is unique 🌿",
  "Enjoy your shopping!💛",
];

const ROUTE_MESSAGES: Record<string, string[]> = {
  "/products": [
    "See anything you like? 🛍️",
    "All handmade with care 🌸",
    "Find your perfect piece ✨",
  ],
  "/cart": [
    "Great picks! 💛",
    "Almost there! 🛒",
    "Funoun loves your taste 🌿",
  ],
  "/custom-order": [
    "Making something special? 🪡",
    "Your idea, our hands 🌸",
    "We love custom requests ✨",
  ],
  "/track": [
    "Your order is on its way! 📦",
    "We packed it with love 💛",
  ],
};

const FAST_SCROLL_MESSAGES = [
  "Woah slow down! 😅",
  "Stop scrolling so fast i'm getting dizzy! 😵",
  "So much to see! 👀",
  "Don't miss anything! 🌸",
];

const CRAZY_HOVER_MESSAGE = "Stop scroling quickly i'm deezy! 😅";

function getMessagesForPath(pathname: string) {
  if (pathname === "/") {
    return DEFAULT_MESSAGES;
  }

  return ROUTE_MESSAGES[pathname] ?? DEFAULT_MESSAGES;
}

export function HeroBird() {
  const { pathname } = useLocation();
  const messages = getMessagesForPath(pathname);
  const hoverControls = useAnimationControls();

  const [msgIndex, setMsgIndex] = useState(0);
  const [showBubble, setShowBubble] = useState(false);
  const [overrideMessage, setOverrideMessage] = useState<string | null>(null);

  const bubbleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const routeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollTriggerRef = useRef(0);
  const lastFastScrollMessageRef = useRef(0);
  const previousScrollYRef = useRef(0);
  const hoverCountRef = useRef(0);

  const clearBubbleTimer = useCallback(() => {
    if (bubbleTimerRef.current) {
      clearTimeout(bubbleTimerRef.current);
      bubbleTimerRef.current = null;
    }
  }, []);

  const clearRouteTimer = useCallback(() => {
    if (routeTimerRef.current) {
      clearTimeout(routeTimerRef.current);
      routeTimerRef.current = null;
    }
  }, []);

  const showBubbleAtIndex = useCallback(
    (index: number) => {
      clearBubbleTimer();
      setMsgIndex(index);
      setOverrideMessage(null);
      setShowBubble(true);

      bubbleTimerRef.current = setTimeout(() => {
        setShowBubble(false);
        setOverrideMessage(null);
        bubbleTimerRef.current = null;
      }, 2500);
    },
    [clearBubbleTimer],
  );

  const showOverrideBubble = useCallback(
    (message: string) => {
      clearBubbleTimer();
      setOverrideMessage(message);
      setShowBubble(true);

      bubbleTimerRef.current = setTimeout(() => {
        setShowBubble(false);
        setOverrideMessage(null);
        bubbleTimerRef.current = null;
      }, 2500);
    },
    [clearBubbleTimer],
  );

  const resetHoverWindow = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }

    hoverTimerRef.current = setTimeout(() => {
      hoverCountRef.current = 0;
      hoverTimerRef.current = null;
    }, 2000);
  }, []);

  const playSmallWiggle = useCallback(async () => {
    await hoverControls.start({
      rotate: [0, -8, 8, -6, 6, 0],
      scale: [1, 1.15, 1],
      transition: { duration: 0.5 },
    });
  }, [hoverControls]);

  const playScrollWiggle = useCallback(async () => {
    await hoverControls.start({
      rotate: [0, -6, 6, -4, 4, 0],
      scale: [1, 1.1, 1],
      transition: { duration: 0.5 },
    });
  }, [hoverControls]);

  useEffect(() => {
    setMsgIndex(0);
    setShowBubble(false);
    setOverrideMessage(null);
    hoverCountRef.current = 0;
    clearBubbleTimer();
    clearRouteTimer();

    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }

    routeTimerRef.current = setTimeout(() => {
      void playSmallWiggle();
      showBubbleAtIndex(0);
      routeTimerRef.current = null;
    }, 600);

    return () => {
      clearRouteTimer();
    };
  }, [pathname, clearBubbleTimer, clearRouteTimer, playSmallWiggle, showBubbleAtIndex]);

  useEffect(() => {
    return () => {
      clearBubbleTimer();
      clearRouteTimer();

      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, [clearBubbleTimer, clearRouteTimer]);

  useEffect(() => {
    previousScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDistance = Math.abs(currentScrollY - previousScrollYRef.current);
      const now = Date.now();

      previousScrollYRef.current = currentScrollY;

      if (now - lastScrollTriggerRef.current >= 1000) {
        lastScrollTriggerRef.current = now;
        void playScrollWiggle();
      }

      if (scrollDistance > 80 && now - lastFastScrollMessageRef.current >= 2000) {
        lastFastScrollMessageRef.current = now;
        const message =
          FAST_SCROLL_MESSAGES[Math.floor(Math.random() * FAST_SCROLL_MESSAGES.length)];
        showOverrideBubble(message);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [playScrollWiggle, showOverrideBubble]);

  const handleHoverStart = useCallback(async () => {
    hoverCountRef.current += 1;
    resetHoverWindow();

    if (hoverCountRef.current >= 4) {
      hoverCountRef.current = 0;

      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
      }

      await hoverControls.start({
        rotate: [0, 360],
        scale: [1, 1.3, 1],
        transition: { duration: 0.8, ease: "easeInOut" },
      });

      hoverControls.set({ rotate: 0, scale: 1 });
      showOverrideBubble(CRAZY_HOVER_MESSAGE);
      return;
    }

    if (hoverCountRef.current === 1) {
      await playSmallWiggle();
      return;
    }

    await hoverControls.start({
      rotate: [0, -15, 15, -12, 12, 0],
      scale: [1, 1.2, 1],
      transition: { duration: 0.6 },
    });
  }, [hoverControls, playSmallWiggle, resetHoverWindow, showOverrideBubble]);

  const handleClick = useCallback(() => {
    clearRouteTimer();

    const nextIndex =
      showBubble && overrideMessage === null ? (msgIndex + 1) % messages.length : msgIndex;

    showBubbleAtIndex(nextIndex);
  }, [clearRouteTimer, messages.length, msgIndex, overrideMessage, showBubble, showBubbleAtIndex]);

  const currentMessage = overrideMessage ?? messages[msgIndex];

  return (
    <div
      className="fixed z-50 pointer-events-auto
                 bottom-[12%] right-[4%]
                 sm:bottom-auto sm:top-[50%] sm:right-[1%]
                 scale-[0.6] sm:scale-75 lg:scale-100
                 origin-bottom-right sm:origin-top-right"
    >
      <AnimatePresence>
        {showBubble && (
          <motion.div
            key={`${pathname}-${msgIndex}-${overrideMessage ?? "default"}`}
            initial={{ opacity: 0, scale: 0, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className="absolute right-[110%] top-1/2 -translate-y-1/2
                       w-44 max-w-[calc(100vw-4rem)] whitespace-normal
                       rounded-xl px-4 py-2 text-xs sm:text-sm font-medium shadow-xl
                       bg-[#1a1025]/95 text-amber-200 border border-white/[0.08]
                       backdrop-blur-sm"
            style={{ transformOrigin: "right center" }}
          >
            {currentMessage}
            <span
              className="absolute right-[-6px] top-1/2 h-3 w-3 -translate-y-1/2
                         rotate-45 bg-[#1a1025]/95 border-t border-r border-white/[0.08]"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        whileTap={{ scale: 0.9 }}
        onHoverStart={handleHoverStart}
        onClick={handleClick}
        className="cursor-pointer select-none"
        aria-label="Click the bird for a message"
      >
        <motion.div animate={hoverControls} initial={{ rotate: 0, scale: 1 }}>
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
          >
            <ellipse cx="30" cy="36" rx="16" ry="13" fill="#C8962E" />
            <ellipse cx="30" cy="36" rx="16" ry="13" fill="url(#bodyGrad)" />

            <ellipse cx="30" cy="39" rx="10" ry="8" fill="#E8C56D" opacity="0.5" />

            <path
              d="M18 32 C12 24, 8 28, 6 22 C10 24, 14 22, 20 28 Z"
              fill="#A37824"
              opacity="0.9"
            />
            <path
              d="M42 32 C48 24, 52 28, 54 22 C50 24, 46 22, 40 28 Z"
              fill="#A37824"
              opacity="0.9"
            />

            <circle cx="30" cy="22" r="10" fill="#D4A83A" />
            <circle cx="30" cy="22" r="10" fill="url(#headGrad)" />

            <circle cx="26" cy="20" r="2.5" fill="#1a1025" />
            <circle cx="34" cy="20" r="2.5" fill="#1a1025" />
            <circle cx="27" cy="19" r="0.8" fill="white" />
            <circle cx="35" cy="19" r="0.8" fill="white" />

            <path d="M28 24 L30 28 L32 24 Z" fill="#E8862E" />

            <circle cx="23" cy="23" r="2" fill="#E8862E" opacity="0.3" />
            <circle cx="37" cy="23" r="2" fill="#E8862E" opacity="0.3" />

            <path
              d="M26 48 C20 54, 16 52, 14 56 C18 52, 22 50, 26 46 Z"
              fill="#A37824"
            />
            <path
              d="M34 48 C40 54, 44 52, 46 56 C42 52, 38 50, 34 46 Z"
              fill="#A37824"
            />

            <path
              d="M25 48 L22 54 M25 48 L25 54 M25 48 L28 54"
              stroke="#C8962E"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M35 48 L32 54 M35 48 L35 54 M35 48 L38 54"
              stroke="#C8962E"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            <path
              d="M27 13 C28 8, 30 10, 30 12 C30 10, 32 8, 33 13"
              stroke="#E8C56D"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />

            <defs>
              <radialGradient id="bodyGrad" cx="0.4" cy="0.3">
                <stop offset="0%" stopColor="#E8C56D" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#C8962E" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="headGrad" cx="0.4" cy="0.3">
                <stop offset="0%" stopColor="#F0D88A" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#D4A83A" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}

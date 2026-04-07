"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import DotFieldBackground from "../components/dot-field-background";

const EXIT_TRANSITION_MS = 900;

export default function EntryPage() {
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);
  const hasEnteredRef = useRef(false);

  const enterPortal = () => {
    if (hasEnteredRef.current) return;
    hasEnteredRef.current = true;
    setIsLeaving(true);

    window.setTimeout(() => {
      router.push("/login");
    }, EXIT_TRANSITION_MS);
  };

  return (
    <main className={`gateway${isLeaving ? " is-leaving" : ""}`}>
      <DotFieldBackground dispersing={isLeaving} />

      <div className="gateway-center">
        <div className="center-stack">
          <button className="entry-mark" onClick={enterPortal} aria-label="Enter 180° Programme">
            180°
          </button>
          <button className="entry-prompt" onClick={enterPortal}>
            Private Access
          </button>
        </div>
      </div>
    </main>
  );
}

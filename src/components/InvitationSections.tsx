"use client";

import { useRef, type MouseEvent } from "react";
import styles from "./InvitationSections.module.css";

type SectionLink = { id: string; label: string };

export default function InvitationSections({ sections, className }: {
  sections: SectionLink[];
  className: string;
}) {
  const menuRef = useRef<HTMLDetailsElement>(null);
  const triggerRef = useRef<HTMLElement>(null);

  function jump(event: MouseEvent<HTMLAnchorElement>, id: string) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const section = document.getElementById(id);
    if (!section) return;
    event.preventDefault();
    if (menuRef.current) menuRef.current.open = false;
    section.focus({ preventScroll: true });
    section.scrollIntoView({ block: "start", behavior: "instant" });
  }

  return <nav className={styles.nav} aria-label="Secciones de la invitación">
    <details
      ref={menuRef}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false;
      }}
      onKeyDown={(event) => {
        if (event.key !== "Escape" || !event.currentTarget.open) return;
        event.preventDefault();
        event.currentTarget.open = false;
        triggerRef.current?.focus();
      }}
    >
      <summary ref={triggerRef} className={className + " " + styles.trigger}>Secciones <span aria-hidden="true">⌄</span></summary>
      <ul className={styles.menu}>
        {sections.map(({ id, label }) => <li key={id}>
          <a href={`#${id}`} onClick={(event) => jump(event, id)}>{label}</a>
        </li>)}
      </ul>
    </details>
  </nav>;
}

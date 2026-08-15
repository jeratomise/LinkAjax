"use client";

import { useState, useEffect, useCallback } from "react";

interface ProfileSection {
  id: string;
  title: string;
  current: string;
  suggested: string;
  options?: string[];
  charLimit: number;
  editUrl: string;
  editUrlFallback?: string;
}

interface ProfileUIProps {
  sections: ProfileSection[];
}

const LINKEDIN_LIMITS = {
  headline: 220,
  headlineRecruiter: 50,
  about: 2600,
  experience: 2000,
};

const LINKEDIN_URLS = {
  intro: "https://www.linkedin.com/in/me/edit/intro/",
  about: "https://www.linkedin.com/in/jeromeng/edit/forms/about/new/?profileFormEntryPoint=PROFILE_SECTION",
  aboutFallback: "https://www.linkedin.com/in/me/edit/about/",
  experience: "https://www.linkedin.com/in/me/details/experience/",
  featured: "https://www.linkedin.com/in/me/details/featured/",
  profile: "https://www.linkedin.com/in/jeromeng/",
};

function CharCounter({ text, limit, label }: { text: string; limit: number; label?: string }) {
  const count = text.length;
  const over = count > limit;
  return (
    <span className={`char-counter ${over ? "over" : ""}`}>
      {label && <span className="label">{label}: </span>}
      {count}/{limit}
    </span>
  );
}

function CopyButton({ text, editUrl, editUrlFallback }: { text: string; editUrl: string; editUrlFallback?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  }, [text]);

  if (copied) {
    return (
      <div className="copy-success">
        <span className="checkmark">✓</span> Copied.{" "}
        <a href={editUrl} target="_blank" rel="noopener noreferrer" className="edit-link">
          Open LinkedIn edit
        </a>
        {editUrlFallback && (
          <>
            {" "}or{" "}
            <a href={editUrlFallback} target="_blank" rel="noopener noreferrer" className="edit-link">
              fallback
            </a>
          </>
        )}
      </div>
    );
  }

  return (
    <button onClick={handleCopy} className="copy-btn">
      Copy
    </button>
  );
}

function ProfileSectionCard({
  section,
  localCurrent,
  onLocalCurrentChange,
}: {
  section: ProfileSection;
  localCurrent: string;
  onLocalCurrentChange: (value: string) => void;
}) {
  const [selectedOption, setSelectedOption] = useState(0);
  const [showPasteBox, setShowPasteBox] = useState(false);

  const displayCurrent = localCurrent || section.current;
  const displaySuggested = section.options ? section.options[selectedOption] : section.suggested;

  return (
    <div className="profile-section">
      <div className="section-header">
        <h3>{section.title}</h3>
        <a href={section.editUrl} target="_blank" rel="noopener noreferrer" className="edit-link-small">
          Edit on LinkedIn ↗
        </a>
      </div>

      <div className="side-by-side">
        <div className="column current">
          <div className="column-header">
            <span className="column-label">Current</span>
            <button className="paste-toggle" onClick={() => setShowPasteBox(!showPasteBox)}>
              {showPasteBox ? "Cancel" : "Paste latest"}
            </button>
          </div>
          {showPasteBox ? (
            <textarea
              className="linkedin-field paste-box"
              placeholder="Paste your current LinkedIn text here to compare..."
              value={localCurrent}
              onChange={(e) => onLocalCurrentChange(e.target.value)}
              rows={6}
            />
          ) : (
            <div className="linkedin-field readonly">
              {displayCurrent || <span className="empty">No snapshot available</span>}
            </div>
          )}
          <CharCounter text={displayCurrent} limit={section.charLimit} />
        </div>

        <div className="column suggested">
          <div className="column-header">
            <span className="column-label">Suggested</span>
            {section.options && section.options.length > 1 && (
              <div className="option-picker">
                {section.options.map((_, i) => (
                  <button
                    key={i}
                    className={`option-btn ${selectedOption === i ? "active" : ""}`}
                    onClick={() => setSelectedOption(i)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="linkedin-field">
            {displaySuggested || <span className="empty">No suggestion available</span>}
          </div>
          <div className="field-actions">
            <CharCounter text={displaySuggested} limit={section.charLimit} />
            {section.id === "headline" && (
              <CharCounter text={displaySuggested} limit={LINKEDIN_LIMITS.headlineRecruiter} label="Recruiter view" />
            )}
            <CopyButton text={displaySuggested} editUrl={section.editUrl} editUrlFallback={section.editUrlFallback} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfileUI({ sections }: ProfileUIProps) {
  const [localCurrents, setLocalCurrents] = useState<Record<string, string>>({});

  useEffect(() => {
    const stored = localStorage.getItem("ajax-profile-currents");
    if (stored) {
      try {
        setLocalCurrents(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const updateLocalCurrent = useCallback((id: string, value: string) => {
    setLocalCurrents((prev) => {
      const next = { ...prev, [id]: value };
      localStorage.setItem("ajax-profile-currents", JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <div className="profile-cockpit">
      <div className="paste-guide">
        <div className="guide-step"><span className="step-num">1</span> Click Copy on the suggested field</div>
        <div className="guide-step"><span className="step-num">2</span> Open the LinkedIn edit link</div>
        <div className="guide-step"><span className="step-num">3</span> Paste and Save. LinkedIn About is plain text. Keep the exact newlines. Do not copy markdown.</div>
      </div>

      <div className="quick-links">
        <a href={LINKEDIN_URLS.profile} target="_blank" rel="noopener noreferrer">View profile ↗</a>
        <a href={LINKEDIN_URLS.intro} target="_blank" rel="noopener noreferrer">Edit intro ↗</a>
        <a href={LINKEDIN_URLS.about} target="_blank" rel="noopener noreferrer">Edit About ↗</a>
        <a href={LINKEDIN_URLS.experience} target="_blank" rel="noopener noreferrer">Experience ↗</a>
        <a href={LINKEDIN_URLS.featured} target="_blank" rel="noopener noreferrer">Featured ↗</a>
      </div>

      {sections.map((section) => (
        <ProfileSectionCard
          key={section.id}
          section={section}
          localCurrent={localCurrents[section.id] || ""}
          onLocalCurrentChange={(value) => updateLocalCurrent(section.id, value)}
        />
      ))}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { TSurveyLanguage } from "@formbricks/types/surveys/types";

interface Props {
  languages: TSurveyLanguage[];
}

export function LanguageSelectorClient({ languages }: Props) {
  const router = useRouter();

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("formbricks-language") : null;
    if (saved && languages.some((l) => l.language.code === saved && l.enabled)) {
      router.replace(`?lang=${saved}`);
    }
  }, [languages, router]);

  const getLanguageDisplay = (code: string): string => {
    const displays: { [key: string]: string } = {
      en: "English",
      vi: "Tiếng Việt",
      fr: "Français",
      de: "Deutsch",
      es: "Español",
      ja: "日本語",
      zh: "中文",
      ko: "한국어",
      ru: "Русский",
    };
    return displays[code.toLowerCase()] || code.toUpperCase();
  };

  const getFlagEmoji = (code: string): string => {
    const flags: { [key: string]: string } = {
      en: "🇬🇧",
      vi: "🇻🇳",
      fr: "🇫🇷",
      de: "🇩🇪",
      es: "🇪🇸",
      ja: "🇯🇵",
      zh: "🇨🇳",
      ko: "🇰🇷",
      ru: "🇷🇺",
    };
    return flags[code.toLowerCase()] || "🌐";
  };

  const handleLanguageClick = (code: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("formbricks-language", code);
      router.replace(`?lang=${code}`);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-white to-slate-50">
      <div className="mx-auto w-full max-w-md space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold leading-9 tracking-tight text-slate-900">Select your language</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Choose your preferred language to continue</p>
        </div>
        <div className="mt-4">
          <div className="-mx-6 divide-y divide-slate-200">
            {languages
              .filter((l) => l.enabled)
              .map((l) => (
                <button
                  key={l.language.code}
                  type="button"
                  onClick={() => handleLanguageClick(l.language.code)}
                  className="focus:ring-brand flex w-full items-center justify-between px-6 py-4 transition duration-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2">
                  <div className="flex items-center space-x-3">
                    <span className="select-none text-2xl">{getFlagEmoji(l.language.code)}</span>
                    <div className="flex flex-col items-start">
                      <p className="font-medium leading-tight text-slate-900">
                        {getLanguageDisplay(l.language.code)}
                      </p>
                      <p className="mt-0.5 text-sm leading-tight text-slate-500">
                        {l.language.code.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-slate-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </button>
              ))}
          </div>
        </div>
        {languages.filter((l) => l.enabled).length > 5 && (
          <p className="text-center text-sm text-slate-500">Scroll to see more languages</p>
        )}
      </div>
    </div>
  );
}

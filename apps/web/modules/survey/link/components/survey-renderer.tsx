import {
  IMPRINT_URL,
  IS_FORMBRICKS_CLOUD,
  IS_RECAPTCHA_CONFIGURED,
  PRIVACY_URL,
  RECAPTCHA_SITE_KEY,
  WEBAPP_URL,
} from "@/lib/constants";
import { getSurveyDomain } from "@/lib/getSurveyUrl";
import { findMatchingLocale } from "@/lib/utils/locale";
import { getMultiLanguagePermission } from "@/modules/ee/license-check/lib/utils";
import { getOrganizationIdFromEnvironmentId } from "@/modules/survey/lib/organization";
import { getResponseCountBySurveyId } from "@/modules/survey/lib/response";
import { getOrganizationBilling } from "@/modules/survey/lib/survey";
import { LinkSurvey } from "@/modules/survey/link/components/link-survey";
import { PinScreen } from "@/modules/survey/link/components/pin-screen";
import { SurveyInactive } from "@/modules/survey/link/components/survey-inactive";
import { getEmailVerificationDetails } from "@/modules/survey/link/lib/helper";
import { getProjectByEnvironmentId } from "@/modules/survey/link/lib/project";
import { type Response } from "@prisma/client";
import { notFound } from "next/navigation";
import { TSurvey } from "@formbricks/types/surveys/types";

interface SurveyRendererProps {
  survey: TSurvey;
  searchParams: {
    verify?: string;
    lang?: string;
    embed?: string;
    preview?: string;
  };
  singleUseId?: string;
  singleUseResponse?: Pick<Response, "id" | "finished"> | undefined;
  contactId?: string;
  isPreview: boolean;
}

export const renderSurvey = async ({
  survey,
  searchParams,
  singleUseId,
  singleUseResponse,
  contactId,
  isPreview,
}: SurveyRendererProps) => {
  const locale = await findMatchingLocale();
  const langParam = searchParams.lang;
  const isEmbed = searchParams.embed === "true";

  if (survey.status === "draft" || survey.type !== "link") {
    notFound();
  }

  const organizationId = await getOrganizationIdFromEnvironmentId(survey.environmentId);
  const organizationBilling = await getOrganizationBilling(organizationId);
  if (!organizationBilling) {
    throw new Error("Organization not found");
  }
  const isMultiLanguageAllowed = await getMultiLanguagePermission(organizationBilling.plan);

  const isSpamProtectionEnabled = Boolean(IS_RECAPTCHA_CONFIGURED && survey.recaptcha?.enabled);

  if (survey.status !== "inProgress" && !isPreview) {
    return (
      <SurveyInactive
        status={survey.status}
        surveyClosedMessage={survey.surveyClosedMessage ? survey.surveyClosedMessage : undefined}
      />
    );
  }

  // verify email: Check if the survey requires email verification
  let emailVerificationStatus = "";
  let verifiedEmail: string | undefined = undefined;

  if (survey.isVerifyEmailEnabled) {
    const token = searchParams.verify;

    if (token) {
      const emailVerificationDetails = await getEmailVerificationDetails(survey.id, token);
      emailVerificationStatus = emailVerificationDetails.status;
      verifiedEmail = emailVerificationDetails.email;
    }
  }

  // get project
  const project = await getProjectByEnvironmentId(survey.environmentId);
  if (!project) {
    throw new Error("Project not found");
  }

  const getLanguageCode = (): string => {
    if (!langParam || !isMultiLanguageAllowed) return "default";
    else {
      const selectedLanguage = survey.languages.find((surveyLanguage) => {
        return (
          surveyLanguage.language.code === langParam.toLowerCase() ||
          surveyLanguage.language.alias?.toLowerCase() === langParam.toLowerCase()
        );
      });
      if (!selectedLanguage || selectedLanguage?.default || !selectedLanguage?.enabled) {
        return "default";
      }
      return selectedLanguage.language.code;
    }
  };

  const languageCode = getLanguageCode();
  const isSurveyPinProtected = Boolean(survey.pin);
  const responseCount = await getResponseCountBySurveyId(survey.id);
  const surveyDomain = getSurveyDomain();

  // Show language selection if multi-language is allowed and not selected
  if (isMultiLanguageAllowed && survey.languages.length > 1 && (!langParam || langParam === "default")) {
    const enabledLanguages = survey.languages.filter((l) => l.enabled);

    // Helper function to get language display name
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
      };
      return displays[code.toLowerCase()] || code.toUpperCase();
    };

    // Helper function to get flag emoji
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
      };
      return flags[code.toLowerCase()] || "🌐";
    };

    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto w-full max-w-md space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-lg">
          <div className="text-center">
            <h2 className="text-2xl font-bold leading-9 tracking-tight text-slate-900">
              Select your language
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Choose your preferred language to continue
            </p>
          </div>

          <div className="mt-4">
            <div className="-mx-6 divide-y divide-slate-200">
              {enabledLanguages.map((l) => (
                <a
                  key={l.language.code}
                  href={`?lang=${l.language.code}`}
                  className="flex items-center justify-between px-6 py-4 transition duration-200 hover:bg-slate-50">
                  <div className="flex items-center space-x-3">
                    <span className="select-none text-2xl">{getFlagEmoji(l.language.code)}</span>
                    <div>
                      <p className="font-medium text-slate-900">{getLanguageDisplay(l.language.code)}</p>
                      <p className="text-sm text-slate-500">{l.language.code.toUpperCase()}</p>
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
                </a>
              ))}
            </div>
          </div>

          {enabledLanguages.length > 5 && (
            <p className="text-center text-sm text-slate-500">Scroll to see more languages</p>
          )}
        </div>
      </div>
    );
  }

  if (isSurveyPinProtected) {
    return (
      <PinScreen
        surveyId={survey.id}
        surveyDomain={surveyDomain}
        project={project}
        emailVerificationStatus={emailVerificationStatus}
        singleUseId={singleUseId}
        singleUseResponse={singleUseResponse}
        webAppUrl={WEBAPP_URL}
        IMPRINT_URL={IMPRINT_URL}
        PRIVACY_URL={PRIVACY_URL}
        IS_FORMBRICKS_CLOUD={IS_FORMBRICKS_CLOUD}
        verifiedEmail={verifiedEmail}
        languageCode={languageCode}
        isEmbed={isEmbed}
        locale={locale}
        isPreview={isPreview}
        contactId={contactId}
        recaptchaSiteKey={RECAPTCHA_SITE_KEY}
        isSpamProtectionEnabled={isSpamProtectionEnabled}
      />
    );
  }

  return (
    <LinkSurvey
      survey={survey}
      project={project}
      surveyDomain={surveyDomain}
      emailVerificationStatus={emailVerificationStatus}
      singleUseId={singleUseId}
      singleUseResponse={singleUseResponse}
      webAppUrl={WEBAPP_URL}
      responseCount={survey.welcomeCard.showResponseCount ? responseCount : undefined}
      verifiedEmail={verifiedEmail}
      languageCode={languageCode}
      isEmbed={isEmbed}
      IMPRINT_URL={IMPRINT_URL}
      PRIVACY_URL={PRIVACY_URL}
      IS_FORMBRICKS_CLOUD={IS_FORMBRICKS_CLOUD}
      locale={locale}
      isPreview={isPreview}
      contactId={contactId}
      recaptchaSiteKey={RECAPTCHA_SITE_KEY}
      isSpamProtectionEnabled={isSpamProtectionEnabled}
    />
  );
};

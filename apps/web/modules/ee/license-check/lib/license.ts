import { TEnterpriseLicenseFeatures } from "@/modules/ee/license-check/types/enterprise-license";
import { cache as reactCache } from "react";

export const getEnterpriseLicense = reactCache(
  async (): Promise<{
    active: boolean;
    features: TEnterpriseLicenseFeatures | null;
    lastChecked: Date;
    isPendingDowngrade: boolean;
    fallbackLevel: "live" | "cached" | "grace" | "default";
  }> => {
    // Return all features enabled
    return {
      active: true,
      features: {
        isMultiOrgEnabled: true,
        projects: null, // null means unlimited
        twoFactorAuth: true,
        sso: true,
        whitelabel: true,
        removeBranding: true,
        contacts: true,
        ai: true,
        saml: true,
        spamProtection: true,
        auditLogs: true,
      },
      lastChecked: new Date(),
      isPendingDowngrade: false,
      fallbackLevel: "live" as const,
    };
  }
);

export const getLicenseFeatures = async (): Promise<TEnterpriseLicenseFeatures | null> => {
  return {
    isMultiOrgEnabled: true,
    projects: null,
    twoFactorAuth: true,
    sso: true,
    whitelabel: true,
    removeBranding: true,
    contacts: true,
    ai: true,
    saml: true,
    spamProtection: true,
    auditLogs: true,
  };
};

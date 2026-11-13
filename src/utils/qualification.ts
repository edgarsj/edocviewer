import { msg } from "@lit/localize";
import type { QualificationLevel, SignatureValidationResult } from "../core/parser";

/** Localized name of an eIDAS signature qualification level */
export function qualificationLevelLabel(level: QualificationLevel): string {
  switch (level) {
    case "QESig":
      return msg("Qualified electronic signature", { id: "qualification.QESig" });
    case "QESeal":
      return msg("Qualified electronic seal", { id: "qualification.QESeal" });
    case "AdESig-QC":
      return msg("Advanced electronic signature with a qualified certificate", {
        id: "qualification.AdESigQC",
      });
    case "AdESeal-QC":
      return msg("Advanced electronic seal with a qualified certificate", {
        id: "qualification.AdESealQC",
      });
    case "AdESig":
      return msg("Advanced electronic signature", { id: "qualification.AdESig" });
    case "AdESeal":
      return msg("Advanced electronic seal", { id: "qualification.AdESeal" });
    case "AdES":
      return msg("Advanced electronic signature or seal", { id: "qualification.AdES" });
    default:
      return msg("Signature level could not be determined", {
        id: "qualification.indeterminate",
      });
  }
}

export function isQualifiedLevel(level: QualificationLevel): boolean {
  return level === "QESig" || level === "QESeal";
}

/**
 * The qualification to show for a signature: only once full verification has
 * found it valid, and only when the level could be determined.
 */
export function displayedQualification(signature: SignatureValidationResult) {
  const { qualification, verificationStatus, valid } = signature;
  if (!qualification || verificationStatus !== "verified" || !valid) {
    return undefined;
  }
  return qualification.level === "INDETERMINATE" ? undefined : qualification;
}

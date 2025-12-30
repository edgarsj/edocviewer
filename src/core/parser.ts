export interface SignerInfo {
  signerName: string;
  personalId: string;
  signatureDate: string; // Add signature date
}

export interface RevocationInfo {
  status: "valid" | "revoked" | "unknown";
  method?: "OCSP" | "CRL";
}

export interface TimestampInfo {
  time: string;
  valid: boolean;
}

export type VerificationStatus = 'pending' | 'verified' | 'failed' | 'unknown';

export interface SignatureValidationResult {
  signerInfo: SignerInfo;
  valid: boolean;
  error: string | null;
  allDocumentsSigned: boolean;
  signedFiles: string[];
  unsignedFiles: string[];
  originalVerificationValid: boolean;
  revocation?: RevocationInfo;
  timestamp?: TimestampInfo;
  /** Status of full verification (including revocation checks) */
  verificationStatus: VerificationStatus;
  /** Index to correlate with original signature for updates */
  signatureIndex: number;
}

export interface EdocContainer {
  files: Map<string, Uint8Array>;
  documentFileList: string[];
  metadataFileList: string[];
  signedFileList: string[];
  signatures: any[];
}

// Keep track of the loading promise to avoid multiple imports
let edockitLoading: Promise<typeof import("edockit")> | null = null;

/**
 * Dynamically load the edockit library
 * @returns A promise that resolves to the edockit module
 */
async function loadEdockit() {
  if (!edockitLoading) {
    // Only create the import promise once
    edockitLoading = import(/* webpackChunkName: "edockit-bundle" */ "edockit");
  }
  return edockitLoading;
}

/**
 * Parse an ASiC-E/eDoc file
 * @param fileData Binary data of the eDoc file
 * @returns Parsed container object
 */
export async function parseEdocFile(
  fileData: Uint8Array,
): Promise<EdocContainer> {
  try {
    // Dynamically import edockit only when needed
    const { parseEdoc } = await loadEdockit();
    return parseEdoc(fileData);
  } catch (error) {
    console.error("Error parsing eDoc file:", error);
    throw new Error(`Failed to parse eDoc file: ${(error as Error).message}`);
  }
}

/**
 * Quick verification of signatures (crypto only, no revocation checks)
 * This is fast and can be used to show initial results while full verification runs
 * @param container The parsed container
 * @returns Array of signature validation results with verificationStatus='pending'
 */
export async function verifyEdocSignaturesQuick(
  container: EdocContainer,
): Promise<SignatureValidationResult[]> {
  try {
    // Dynamically import edockit only when needed
    const { verifySignature } = await loadEdockit();

    const signatureResults = await Promise.all(
      container.signatures.map(async (signature, index) => {
        try {
          // Quick verification - crypto only, no network calls
          const result = await verifySignature(signature, container.files, {
            checkRevocation: false,
            verifyTimestamps: false,
          });

          // Format signer info
          let signerName = "";
          let personalId = "";
          let signatureDate = "";

          if (signature.signerInfo) {
            const { givenName, surname, commonName, serialNumber } =
              signature.signerInfo;

            if (givenName && surname) {
              signerName = `${givenName} ${surname}`;
            } else if (commonName) {
              signerName = commonName;
            }

            personalId = serialNumber || "";
          }

          // Extract signature date if available
          if (signature.signingTime) {
            // Format the signature date as yyyy-mm-dd HH:mm
            try {
              const date = new Date(signature.signingTime);

              // Get date parts
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, "0");
              const day = String(date.getDate()).padStart(2, "0");

              // Get time parts
              const hours = String(date.getHours()).padStart(2, "0");
              const minutes = String(date.getMinutes()).padStart(2, "0");

              // Format as yyyy-mm-dd HH:mm
              signatureDate = `${year}-${month}-${day} ${hours}:${minutes}`;
            } catch (e) {
              console.error("Error formatting signature date:", e);
              signatureDate = signature.signingTime || "";
            }
          }

          // Check if all document files are signed
          const signedFiles = signature.references || [];
          const allDocumentsSigned = checkAllDocumentsSigned(
            container.documentFileList,
            signedFiles,
          );

          // Get lists of signed and unsigned files
          const unsignedFiles = container.documentFileList.filter(
            (file) => !signedFiles.includes(file),
          );

          const cryptoValid = result.isValid && allDocumentsSigned;

          return {
            signerInfo: {
              signerName,
              personalId,
              signatureDate,
            },
            valid: cryptoValid,
            error: result.isValid
              ? allDocumentsSigned
                ? null
                : "Not all document files are signed"
              : result.errors?.[0] || "Verification failed",
            allDocumentsSigned,
            signedFiles,
            unsignedFiles,
            originalVerificationValid: result.isValid,
            // Mark as pending - full verification still needed
            verificationStatus: cryptoValid ? 'pending' : 'failed',
            signatureIndex: index,
          } as SignatureValidationResult;
        } catch (error) {
          console.error("Error verifying signature:", error);
          return {
            signerInfo: {
              signerName: "Unknown",
              personalId: "",
              signatureDate: "",
            },
            valid: false,
            error: (error as Error).message,
            allDocumentsSigned: false,
            signedFiles: [],
            unsignedFiles: container.documentFileList || [],
            originalVerificationValid: false,
            verificationStatus: 'failed',
            signatureIndex: index,
          } as SignatureValidationResult;
        }
      }),
    );

    return signatureResults;
  } catch (error) {
    console.error("Error verifying signatures:", error);
    throw new Error(`Failed to verify signatures: ${(error as Error).message}`);
  }
}

/**
 * Full verification of a single signature (including revocation and timestamp checks)
 * This is slow due to network calls for CRL/OCSP data
 * @param container The parsed container
 * @param signatureIndex Index of the signature to verify
 * @param quickResult The quick verification result to update
 * @returns Updated signature validation result with full verification status
 */
export async function verifyEdocSignatureFull(
  container: EdocContainer,
  signatureIndex: number,
  quickResult: SignatureValidationResult,
): Promise<SignatureValidationResult> {
  // If quick verification already failed, no need to do full verification
  if (quickResult.verificationStatus === 'failed') {
    return quickResult;
  }

  try {
    const { verifySignature } = await loadEdockit();
    const signature = container.signatures[signatureIndex];

    // Full verification with revocation and timestamp checks
    const result = await verifySignature(signature, container.files, {
      checkRevocation: true,
      verifyTimestamps: true,
      revocationOptions: {
        proxyUrl: 'https://cors-proxy.edocviewer.app/?url=',
      },
    });

    // Extract revocation info if available
    const revocation: RevocationInfo | undefined = result.revocation
      ? {
          status: result.revocation.status,
          method: result.revocation.method,
        }
      : undefined;

    // Extract timestamp info if available
    const timestamp: TimestampInfo | undefined = result.timestamp
      ? {
          time: result.timestamp.time,
          valid: result.timestamp.valid,
        }
      : undefined;

    // Determine final validity - must pass both crypto and revocation checks
    const isFullyValid = result.isValid && quickResult.allDocumentsSigned;
    const revocationValid = revocation?.status === 'valid';
    const revocationUnknown = !revocation || revocation.status === 'unknown';
    const revocationRevoked = revocation?.status === 'revoked';

    // Determine verification status: verified (green), unknown (yellow), failed (red)
    const verificationStatus: VerificationStatus = !isFullyValid || revocationRevoked
      ? 'failed'
      : revocationUnknown
        ? 'unknown'
        : 'verified';

    return {
      ...quickResult,
      valid: isFullyValid && revocationValid,
      error: !result.isValid
        ? result.errors?.[0] || "Verification failed"
        : revocationRevoked
          ? `Certificate revoked`
          : quickResult.error,
      revocation,
      timestamp,
      verificationStatus,
    };
  } catch (error) {
    console.error("Error in full signature verification:", error);
    return {
      ...quickResult,
      verificationStatus: 'failed',
      error: quickResult.error || (error as Error).message,
    };
  }
}

/**
 * Check if all document files are signed
 * @param documentFileList List of document files
 * @param signedFiles List of files that are signed
 * @returns True if all document files are signed
 */
function checkAllDocumentsSigned(
  documentFileList: string[],
  signedFiles: string[],
): boolean {
  if (!documentFileList || documentFileList.length === 0) {
    return true; // No documents to check
  }
  if (!signedFiles || signedFiles.length === 0) {
    return false; // No signed files
  }

  // Check if every document file is in the signed files list
  return documentFileList.every((docFile) => signedFiles.includes(docFile));
}

import i18n from "../utils/i18n";

export interface FileDropzoneOptions {
  dropzoneId: string;
  fileInputId: string;
  selectButtonId: string;
  onFileSelected: (file: File) => void | Promise<void>;
  acceptedFileTypes?: string[];
  suggestedFileName?: string;
  suggestedFileContainerId?: string;
  suggestedFileNameId?: string;
}

export class FileDropzone {
  private options: FileDropzoneOptions;
  private dropzoneElement: HTMLElement | null = null;
  private fileInputElement: HTMLInputElement | null = null;
  private selectButtonElement: HTMLElement | null = null;

  constructor(options: FileDropzoneOptions) {
    this.options = {
      acceptedFileTypes: [".edoc", ".asice"],
      ...options,
    };

    this.init();
  }

  /**
   * Initialize the dropzone
   */
  private init(): void {
    // Get DOM elements
    this.dropzoneElement = document.getElementById(this.options.dropzoneId);
    this.fileInputElement = document.getElementById(
      this.options.fileInputId,
    ) as HTMLInputElement;
    this.selectButtonElement = document.getElementById(
      this.options.selectButtonId,
    );

    if (
      !this.dropzoneElement ||
      !this.fileInputElement ||
      !this.selectButtonElement
    ) {
      console.error("Could not find all required elements for file dropzone");
      return;
    }

    // Setup select button click
    this.selectButtonElement.addEventListener("click", () => {
      this.fileInputElement?.click();
    });

    // Handle file selection
    this.fileInputElement.addEventListener("change", (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        this.handleFiles(files);
      }
    });

    // Setup drag and drop
    this.dropzoneElement.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.dropzoneElement?.classList.add("dropzone-active");
    });

    this.dropzoneElement.addEventListener("dragleave", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.dropzoneElement?.classList.remove("dropzone-active");
    });

    this.dropzoneElement.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.dropzoneElement?.classList.remove("dropzone-active");

      if (e.dataTransfer?.files.length) {
        this.handleFiles(e.dataTransfer.files);
      }
    });

    // Display suggested file if provided
    if (
      this.options.suggestedFileName &&
      this.options.suggestedFileContainerId &&
      this.options.suggestedFileNameId
    ) {
      const suggestedFileContainer = document.getElementById(
        this.options.suggestedFileContainerId,
      );
      const suggestedFileNameElement = document.getElementById(
        this.options.suggestedFileNameId,
      );

      if (suggestedFileContainer && suggestedFileNameElement) {
        suggestedFileContainer.classList.remove("hidden");
        suggestedFileNameElement.textContent = this.options.suggestedFileName;
      }
    }

    // Subscribe to language changes
    i18n.subscribe(() => {
      this.updateTranslations();
    });

    // Initial translations
    this.updateTranslations();
  }

  /**
   * Update translations for the dropzone
   */
  private updateTranslations(): void {
    // Apply translations to specific elements
    const titleElement = this.dropzoneElement?.querySelector(
      "[id$='dropzone-title']",
    );
    const descriptionElement = this.dropzoneElement?.querySelector(
      "[id$='dropzone-description']",
    );
    const selectBtnElement = this.dropzoneElement?.querySelector(
      "[id$='select-file-btn']",
    );
    const suggestedFileLabelElement = this.dropzoneElement?.querySelector(
      "[id$='suggested-file-label']",
    );

    if (titleElement) {
      titleElement.textContent = i18n.translate("dropzone.title");
    }

    if (descriptionElement) {
      descriptionElement.textContent = i18n.translate("dropzone.description");
    }

    if (selectBtnElement) {
      selectBtnElement.textContent = i18n.translate("dropzone.selectFile");
    }

    if (suggestedFileLabelElement) {
      suggestedFileLabelElement.textContent = i18n.translate(
        "dropzone.suggestedFileLabel",
      );
    }
  }

  /**
   * Handle files from input or drop
   */
  private handleFiles(files: FileList): void {
    const file = files[0]; // Take the first file

    // Check file type
    const isValidType = this.validateFileType(file);
    if (!isValidType) {
      alert(
        `Please select a valid file type (${this.options.acceptedFileTypes?.join(", ")})`,
      );
      return;
    }

    // Pass the file to the callback
    this.options.onFileSelected(file);
  }

  /**
   * Validate if the file type is accepted
   */
  private validateFileType(file: File): boolean {
    if (
      !this.options.acceptedFileTypes ||
      this.options.acceptedFileTypes.length === 0
    ) {
      return true;
    }

    return this.options.acceptedFileTypes.some((type) =>
      file.name.toLowerCase().endsWith(type),
    );
  }
}

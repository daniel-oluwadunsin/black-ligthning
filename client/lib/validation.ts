const TEN_MB = 10 * 1024 * 1024;

export const MAX_FILE_SIZE_BYTES = TEN_MB;

const hasMimePrefix = (file: File, mimePrefix: string) =>
  file.type.toLowerCase().startsWith(mimePrefix);

export const validateTextField = (
  value: string,
  label: string,
): string | null => {
  if (!value.trim()) {
    return `${label} is required.`;
  }

  return null;
};

export const validateArtworkFile = (file: File | null): string | null => {
  if (!file) {
    return "Artwork file is required.";
  }

  if (!hasMimePrefix(file, "image/")) {
    return "Artwork must be an image file.";
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "Artwork file must be 10MB or smaller.";
  }

  return null;
};

export const validateAudioFile = (
  file: File | null,
  fieldLabel = "Audio file",
): string | null => {
  if (!file) {
    return `${fieldLabel} is required.`;
  }

  if (!hasMimePrefix(file, "audio/")) {
    return `${fieldLabel} must be an audio file.`;
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `${fieldLabel} must be 10MB or smaller.`;
  }

  return null;
};

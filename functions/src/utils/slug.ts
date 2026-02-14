// Basic slug generation
export const generateSlug = (name: string): string => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
        .replace(/^-+|-+$/g, '');    // Trim leading/trailing hyphens
};

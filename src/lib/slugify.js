function slugify(str) {
  const turkishCharacters = {
    ı: 'i',
    İ: 'I',
    ş: 's',
    Ş: 'S',
    ğ: 'g',
    Ğ: 'G',
    ü: 'u',
    Ü: 'U',
    ö: 'o',
    Ö: 'O',
    ç: 'c',
    Ç: 'C',
  };

  return str
    .toLowerCase()
    .replace(/[ıİşŞğĞüÜöÖçÇ]/g, (char) => turkishCharacters[char] || char)
    .replace(/\s+/g, '-') // Replace spaces with "-"
    .replace(/[^a-zA-Z0-9-]/g, '') // Remove any remaining non-alphanumeric characters
    .replace(/-+/g, '-'); // Replace consecutive dashes with a single dash
}

module.exports = slugify;
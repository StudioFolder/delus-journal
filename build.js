const fs = require('fs');
const { marked } = require('marked');

// Parse content.md into named sections split by ## headings
function parseSections(markdown) {
  const sections = {};
  const sectionRegex = /^## (.+)$/gm;
  const parts = markdown.split(sectionRegex);

  // parts[0] is content before the first heading (ignored)
  for (let i = 1; i < parts.length; i += 2) {
    const slug = parts[i].trim().toLowerCase().replace(/\s+/g, '-');
    const body = (parts[i + 1] || '').trim();
    sections[slug] = marked.parse(body);
  }

  return sections;
}

const template = fs.readFileSync('template.html', 'utf-8');
const markdown = fs.readFileSync('content.md', 'utf-8');

const sections = parseSections(markdown);

let output = template;

// Inject all sections as {{SLUG}} placeholders (slugs uppercased with hyphens→underscores)
Object.entries(sections).forEach(([slug, html]) => {
  const placeholder = `{{${slug.toUpperCase().replace(/-/g, '_')}}}`;
  output = output.replaceAll(placeholder, html);
});

// Inject page-specific md files (about.md, donate.md) into named placeholders
const pages = [
  { file: 'about.md',  prefix: 'ABOUT' },
  { file: 'donate.md', prefix: 'DONATE' },
];
pages.forEach(({ file, prefix }) => {
  if (!fs.existsSync(file)) return;
  const pageSections = parseSections(fs.readFileSync(file, 'utf-8'));
  if (pageSections['main'])    output = output.replaceAll(`{{${prefix}_MAIN}}`,    pageSections['main']);
  if (pageSections['cta'])     output = output.replaceAll(`{{${prefix}_CTA}}`,     pageSections['cta']);
  if (pageSections['service']) output = output.replaceAll(`{{${prefix}_SERVICE}}`, pageSections['service']);
});

// Strip any unmatched {{PLACEHOLDER}} tags (e.g., section removed from content.md)
output = output.replace(/\{\{[A-Z_]+\}\}/g, '');

fs.writeFileSync('index.html', output);
console.log('✓ Built index.html from content.md');

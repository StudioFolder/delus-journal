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

// Expected sections: intro, open-call, dates, cta, contact, footer
const required = ['intro', 'open-call', 'dates', 'cta', 'contact', 'footer'];
required.forEach(slug => {
  if (!sections[slug]) {
    console.warn(`⚠  Missing section: "${slug}" in content.md`);
  }
});

let output = template;

// Inject all sections as {{SLUG}} placeholders (slugs uppercased with hyphens→underscores)
Object.entries(sections).forEach(([slug, html]) => {
  const placeholder = `{{${slug.toUpperCase().replace(/-/g, '_')}}}`;
  output = output.replaceAll(placeholder, html);
});

fs.writeFileSync('index.html', output);
console.log('✓ Built index.html from content.md');

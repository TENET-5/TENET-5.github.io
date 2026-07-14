const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname);
const files = fs.readdirSync(directoryPath).filter(file => file.endsWith('.html'));

const links = [
    { href: 'index.html', text: 'Home' },
    { href: 'news.html', text: 'News' },
    { href: 'daily-briefing.html', text: 'Briefing' },
    { href: 'investigations.html', text: 'Investigations' },
    { href: 'argument.html', text: 'The Case' },
    { href: 'evidence-index.html', text: 'Evidence' },
    { href: 'about.html', text: 'About' }
];

let updatedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Regular expression to match <nav aria-label="Primary">...</nav>
    // or <nav class="cover-nav" aria-label="Primary">...</nav>
    const navRegex = /(<nav\s+[^>]*aria-label="Primary"[^>]*>)([\s\S]*?)(<\/nav>)/i;
    
    if (navRegex.test(content)) {
        // Build the new inner HTML
        let newInnerHtml = '\n';
        links.forEach(link => {
            const isCurrent = (file === link.href) ? ' aria-current="page"' : '';
            newInnerHtml += `      <a href="${link.href}"${isCurrent}>${link.text}</a>\n`;
        });
        newInnerHtml += '    ';
        
        // Replace the content
        content = content.replace(navRegex, (match, openTag, oldInner, closeTag) => {
            return `${openTag}${newInnerHtml}${closeTag}`;
        });
        
        fs.writeFileSync(file, content, 'utf8');
        updatedCount++;
    }
});

console.log(`Successfully unified the top navigation bar across ${updatedCount} HTML files!`);

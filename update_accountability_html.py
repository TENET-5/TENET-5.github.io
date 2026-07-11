import re
import os

html_path = 'E:/TENET-5.github.io/accountability.html'
js_path = 'E:/TENET-5.github.io/js/accountability.js'

with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# We need to find the section where the records are.
# The first purchase-item is around line 66: <div class="purchase-item">
# The last record is at the end.
# Actually, we can use regex to remove everything from the first <div class="purchase-item"> or <div class="record">
# to the end of the last </div> before the closing tags or just remove all <div class="purchase-item"> and <div class="record"> ... </div> and <div class="section-divider">

# A safer approach using BeautifulSoup:
from bs4 import BeautifulSoup
soup = BeautifulSoup(content, 'html.parser')

# Find the container that holds these elements
# Usually it's a specific div, maybe <div class="container"> or <main>
# Let's just extract all purchase-item, record, and section-divider
items_to_remove = soup.find_all(['div'], class_=['purchase-item', 'record', 'section-divider'])

if items_to_remove:
    # Find the parent of the first item
    parent = items_to_remove[0].parent
    
    # We want to insert our new UI elements exactly where the first item was
    insertion_point = items_to_remove[0]
    
    # Create the filter UI and container using beautifulsoup
    ui_html = """
    <div class="cap263-container-narrow" id="accountability-filters">
      <div class="cap263-flex-row cap263-mb-2">
        <input type="text" id="search-filter" placeholder="Search records..." class="cap263-pill-btn" style="flex: 2; background: rgba(0,0,0,0.5); color: var(--ice); border: 1px solid var(--ice-deep);">
        <select id="level-filter" class="cap263-pill-btn" style="background: rgba(0,0,0,0.5); color: var(--ice); border: 1px solid var(--ice-deep);"><option value="">All Levels</option></select>
        <select id="party-filter" class="cap263-pill-btn" style="background: rgba(0,0,0,0.5); color: var(--ice); border: 1px solid var(--ice-deep);"><option value="">All Parties</option></select>
        <select id="type-filter" class="cap263-pill-btn" style="background: rgba(0,0,0,0.5); color: var(--ice); border: 1px solid var(--ice-deep);"><option value="">All Types</option></select>
        <select id="outcome-filter" class="cap263-pill-btn" style="background: rgba(0,0,0,0.5); color: var(--ice); border: 1px solid var(--ice-deep);"><option value="">All Outcomes</option></select>
        <select id="year-filter" class="cap263-pill-btn" style="background: rgba(0,0,0,0.5); color: var(--ice); border: 1px solid var(--ice-deep);"><option value="">All Years</option></select>
      </div>
    </div>
    <div id="accountability-records-container"></div>
    <div id="pagination-controls" class="cap263-flex-row cap263-mt-2" style="justify-content: center; margin-bottom: 2rem;"></div>
    """
    ui_soup = BeautifulSoup(ui_html, 'html.parser')
    
    insertion_point.insert_before(ui_soup)
    
    for item in items_to_remove:
        item.decompose()

    # ensure the script is included
    script_tag = soup.new_tag('script', src='js/accountability.js')
    soup.body.append(script_tag)
    
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(str(soup))
        
print("HTML updated.")

# Now write the JS file
js_code = """
document.addEventListener('DOMContentLoaded', () => {
    let allRecords = [];
    let filteredRecords = [];
    const PAGE_SIZE = 20;
    let currentPage = 1;

    const container = document.getElementById('accountability-records-container');
    const pagination = document.getElementById('pagination-controls');
    const filters = {
        search: document.getElementById('search-filter'),
        level: document.getElementById('level-filter'),
        party: document.getElementById('party-filter'),
        type: document.getElementById('type-filter'),
        outcome: document.getElementById('outcome-filter'),
        year: document.getElementById('year-filter')
    };

    fetch('data/accountability.json')
        .then(response => response.json())
        .then(data => {
            allRecords = data;
            filteredRecords = data;
            populateFilterOptions();
            renderPage();
        });

    function populateFilterOptions() {
        const levels = new Set();
        const parties = new Set();
        const types = new Set();
        const outcomes = new Set();
        const years = new Set();

        allRecords.forEach(rec => {
            if (rec.level) levels.add(rec.level);
            if (rec.party) parties.add(rec.party);
            if (rec.type) types.add(rec.type);
            if (rec.outcome_class) outcomes.add(rec.outcome_class);
            if (rec.year) years.add(rec.year);
        });

        levels.forEach(val => filters.level.add(new Option(val, val)));
        parties.forEach(val => filters.party.add(new Option(val, val)));
        types.forEach(val => filters.type.add(new Option(val, val)));
        outcomes.forEach(val => filters.outcome.add(new Option(val, val)));
        years.forEach(val => filters.year.add(new Option(val, val)));
    }

    function applyFilters() {
        const term = filters.search.value.toLowerCase();
        const level = filters.level.value;
        const party = filters.party.value;
        const type = filters.type.value;
        const outcome = filters.outcome.value;
        const year = filters.year.value;

        filteredRecords = allRecords.filter(rec => {
            if (term && !rec.data_search.toLowerCase().includes(term) && !rec.name.toLowerCase().includes(term)) return false;
            if (level && rec.level !== level) return false;
            if (party && rec.party !== party) return false;
            if (type && rec.type !== type) return false;
            if (outcome && rec.outcome_class !== outcome) return false;
            if (year && rec.year !== year) return false;
            return true;
        });

        currentPage = 1;
        renderPage();
    }

    Object.values(filters).forEach(f => {
        if (f) f.addEventListener('input', applyFilters);
    });

    function renderPage() {
        container.innerHTML = '';
        const start = (currentPage - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        const pageData = filteredRecords.slice(start, end);

        pageData.forEach(rec => {
            const div = document.createElement('div');
            div.className = 'record';
            div.setAttribute('data-level', rec.data_level);
            div.setAttribute('data-party', rec.data_party);
            div.setAttribute('data-type', rec.data_type);

            let headerHTML = `<div class="rec-header">
                <span class="rec-name">${rec.name}</span>
                <span class="rec-party ${rec.party_class}">${rec.party}</span>
                <span class="rec-level">${rec.level}</span>
                <span class="rec-year">${rec.year}</span>
                <span class="rec-type ${rec.type_class}">${rec.type}</span>
            </div>`;
            
            let detailHTML = `<div class="rec-detail">${rec.detail}</div>`;
            
            let outcomeHTML = rec.outcome ? `<div class="rec-outcome ${rec.outcome_class}">${rec.outcome}</div>` : '';

            div.innerHTML = headerHTML + detailHTML + outcomeHTML;
            container.appendChild(div);
        });

        renderPagination();
    }

    function renderPagination() {
        pagination.innerHTML = '';
        const totalPages = Math.ceil(filteredRecords.length / PAGE_SIZE);
        if (totalPages <= 1) return;

        const prevBtn = document.createElement('button');
        prevBtn.textContent = 'Previous';
        prevBtn.className = 'cap263-pill-btn cap263-card-link';
        prevBtn.disabled = currentPage === 1;
        prevBtn.onclick = () => { currentPage--; renderPage(); };
        pagination.appendChild(prevBtn);

        const pageInfo = document.createElement('span');
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        pageInfo.style.margin = '0 1rem';
        pageInfo.style.alignSelf = 'center';
        pageInfo.style.color = 'var(--ice)';
        pagination.appendChild(pageInfo);

        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Next';
        nextBtn.className = 'cap263-pill-btn cap263-card-link';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.onclick = () => { currentPage++; renderPage(); };
        pagination.appendChild(nextBtn);
    }
});
"""

os.makedirs(os.path.dirname(js_path), exist_ok=True)
with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js_code)

print("JS written.")

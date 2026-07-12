document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('investigations-container');
  if (!container) return;

  fetch('data/investigations.json')
    .then(res => res.json())
    .then(data => {
      container.innerHTML = '';
      data.forEach(category => {
        let sectionHtml = `
          <section class="catalog" id="${category.id}">
            <span class="kick section-num">${category.title}</span><span class="kick-meta"> · ${category.items.length} files</span>
            <div class="cat-group">
        `;
        
        category.items.forEach(item => {
          sectionHtml += `
              <a class="cat-item glass" href="${item.href}" data-narrate="${item.narrate}">
                <span class="t">${item.title}</span>
                <span class="d">${item.description}</span>
              </a>
          `;
        });
        
        sectionHtml += `
            </div>
          </section>
        `;
        container.innerHTML += sectionHtml;
      });
    })
    .catch(err => console.error('Failed to load investigations data:', err));
});

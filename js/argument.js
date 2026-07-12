document.addEventListener('DOMContentLoaded', () => {
  const actsContainer = document.querySelector('.media-grid.media-grid-2');
  if (!actsContainer) return;

  fetch('data/argument.json')
    .then(res => res.json())
    .then(data => {
      actsContainer.innerHTML = '';
      data.forEach(act => {
        actsContainer.innerHTML += `
          <a class="media-card glass is-cine act-next" href="${act.link}" role="listitem">
            <div class="media-frame is-cine">
              <video autoplay muted loop playsinline preload="auto" poster="${act.poster}" data-act-cine aria-hidden="true">
                <source src="${act.videoSrc}" type="video/mp4">
              </video>
              <span class="media-tag">${act.tag}</span>
            </div>
            <div class="media-body">
              <span class="kick">${act.kick}</span>
              <h3>${act.title}</h3>
              <p>${act.description}</p>
              <p style="font-size: 0.9em; opacity: 0.9;">${act.evidence}</p>
              <span class="media-more">Enter stage →</span>
            </div>
          </a>
        `;
      });

      // Append the final chart card
      actsContainer.innerHTML += `
        <article class="media-card glass" role="listitem">
          <div class="media-frame">
            <img src="media/landing/committee_empty.jpg" alt="Chart: MAID provisions rising over time" width="800" height="500" loading="lazy">
            <span class="media-tag">Chart · volume</span>
          </div>
          <div class="media-body">
            <span class="kick">Read with the acts</span>
            <h3>MAID trajectory</h3>
            <p>Health Canada volume behind the argument. Open the numbers, then return to the acts.</p>
            <a class="media-more" href="demographic-trajectory.html">Demographic board →</a>
            <a class="media-more" href="maid-accountability.html">MAID file →</a>
          </div>
        </article>
      `;
    })
    .catch(err => console.error('Failed to load argument data:', err));
});

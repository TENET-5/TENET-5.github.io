// PRISM OS Taskbar global injection
(function() {
  if (document.getElementById('prism-os-taskbar')) return;
  
  // 1. Inject CSS
  var head = document.head || document.documentElement;
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'css/prism-os-taskbar.css?v=1';
  head.appendChild(link);

  // 2. Inject HTML
  var bar = document.createElement('div');
  bar.id = 'prism-os-taskbar';
  bar.innerHTML = 
    '<div class="taskbar-left">' +
      '<span class="brand-name">TENET<sup>5</sup></span>' +
      '<span class="powered-by">POWERED BY LIRIL AI</span>' +
    '</div>' +
    '<nav class="taskbar-center">' +
      '<a href="news.html" data-page="news.html">NEWS</a>' +
      '<a href="daily-briefing.html" data-page="daily-briefing.html">BRIEFING</a>' +
      '<a href="investigations.html" data-page="investigations.html">INVESTIGATIONS</a>' +
      '<a href="argument.html" data-page="argument.html">THE CASE</a>' +
      '<a href="evidence-index.html" data-page="evidence-index.html">EVIDENCE</a>' +
      '<a href="information-architecture.html" data-page="information-architecture.html">MAP</a>' +
      '<a href="prism-studio.html" data-page="prism-studio.html">PRISM STUDIO</a>' +
    '</nav>' +
    '<div class="taskbar-right">' +
      '<span class="dateline" id="prism-os-dateline"></span>' +
    '</div>';
  document.body.appendChild(bar);

  // 3. Highlight Active Link
  var path = window.location.pathname.split('/').pop();
  if (!path || path === '' || path === '/') path = 'index.html';
  var links = bar.querySelectorAll('.taskbar-center a');
  for (var i = 0; i < links.length; i++) {
    if (links[i].getAttribute('data-page') === path) {
      links[i].classList.add('active');
    }
  }

  // 4. Update Time Dial
  function updateDateline() {
    var dateline = document.getElementById('prism-os-dateline');
    if (!dateline) return;
    try {
      var d = new Date();
      var options = { timeZone: 'America/New_York', hour12: false, weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
      var estString = new Intl.DateTimeFormat('en-US', options).format(d);
      dateline.textContent = estString.toUpperCase() + ' ET';
    } catch (e) {
      dateline.textContent = d.toUTCString().toUpperCase();
    }
  }
  updateDateline();
  setInterval(updateDateline, 1000);
})();

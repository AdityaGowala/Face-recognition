document.querySelectorAll('.navbar-links a').forEach(link => {
    if (window.location.href.includes(link.href)) {
      link.classList.add('active');
    }
  });
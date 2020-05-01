[...document.querySelectorAll('code')]
   .filter(e => e.parentElement.nodeName === 'PRE')
   .forEach(elem => elem.parentElement.classList.add('prettyprint'));

document.querySelectorAll('p br').forEach(e => e.remove());
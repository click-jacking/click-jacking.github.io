const inpt = document.getElementById('inpt');
const checkBtn = document.getElementById('button-addon2');
const secFrame = document.getElementById('sec-frame');
const shareBtn = document.getElementById('share-btn');
var url;

// Function to update session storage with the input value.
const updateSessionStorage = (inputValue) => {
  sessionStorage.setItem('inputValue', inputValue);
};

// Function to retrieve the input value from session storage.
const getSessionStorageInputValue = () => {
  return sessionStorage.getItem('inputValue');
};

const checkJack = () => {
  shareBtn.classList.remove('none');

  // Get the URL from the query parameter.
  url = new URLSearchParams(window.location.search).get('url');

  // Check if the current URL has a query parameter
  if (url) {
    // Store the searched value in session storage
    const inputValue = inpt.value.trim();
    updateSessionStorage(inputValue);

    // Remove the query parameter from the URL
    const currentURL = new URL(window.location.href);
    currentURL.searchParams.delete('url');
    history.pushState(null, '', currentURL.toString());

    // Treat the session storage value as the URL
    url = getSessionStorageInputValue();
    inpt.value = url; // Populate the input field with the session storage value
  } else {
    // If the URL parameter is not present, use the value of the `inpt` element.
    url = inpt.value.trim();
  }

  if (url !== '') {
    const iframe = secFrame.querySelector('iframe');
    if (iframe) {
      iframe.src = url;
    } else {
      secFrame.innerHTML = `<iframe src="${url}" frameborder="0"></iframe>`;
    }

    // Add a loading indicator.
    secFrame.classList.add('loading');

    // Check for the iframe load event.
    iframe.addEventListener('load', () => {
      // Remove the loading indicator.
      secFrame.classList.remove('loading');
    });
  } else {
    alert('Enter a URL');
  }
};

shareBtn.addEventListener('click', () => {
  // Get the entire URL, including the query part.
  const currentURL = new URL(window.location.href);
  const inputValue = inpt.value.trim();

  // If there's a query parameter, use the current URL with the query.
  if (currentURL.searchParams.has('url')) {
    // Copy the entire URL with the query parameter to the clipboard.
    navigator.clipboard.writeText(currentURL.toString());
  } else {
    // Copy the URL with the query parameter based on the current input value.
    currentURL.searchParams.set('url', inputValue);
    navigator.clipboard.writeText(currentURL.toString());
    // Restore the input value in session storage.
    updateSessionStorage(inputValue);
  }

  // Change the button content to "Copied ✔".
  shareBtn.textContent = 'Copied ✔';

  // Remove the copied tick after 2 seconds.
  setTimeout(() => {
    shareBtn.textContent = 'Share';
  }, 3000);
});

checkBtn.addEventListener('click', checkJack);

// Add this code to handle the query parameter on page load
window.addEventListener('load', () => {
  const urlParam = new URLSearchParams(window.location.search).get('url');
  if (urlParam) {
    // Set the input field value to the URL query parameter.
    inpt.value = decodeURIComponent(urlParam);

    // Call the checkJack function to use the URL from the query parameter.
    checkJack();
  }
});

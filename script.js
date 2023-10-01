const inpt = document.getElementById('inpt');
const checkBtn = document.getElementById('button-addon2');
const secFrame = document.getElementById('sec-frame');
const shareBtn = document.getElementById('share-btn');
const resultsDiv = document.getElementById('resultsDiv');
const resultsDivElems = {
  time: document.getElementById('resultTime'),
  ip: document.getElementById('resultIp'),
  xFrame: document.getElementById('resultX-frame'),
  Csp: document.getElementById('resultAsp')
}
var url;

window.addEventListener('load', () => {
  const urlParam = new URLSearchParams(window.location.search).get('url');
  if (urlParam) {
    // Set the input field value to the URL query parameter.
    inpt.value = decodeURIComponent(urlParam);
    // Call the checkJack function to use the URL from the query parameter.
    checkJack();
  }
})


const updateSessionStorage = (inputValue) => {
  sessionStorage.setItem('inputValue', inputValue);
};
const getSessionStorageInputValue = () => {
  return sessionStorage.getItem('inputValue');
};

const checkJack = () => {
  shareBtn.textContent = 'Share results';
  // Get the URL from the query parameter.
  url = new URLSearchParams(window.location.search).get('url');
  // Check if the current URL has a query parameter
  const urlRegex = /^(https?:\/\/)?([\w.-]+)(\/[^\s]*)?$/;

  if (!urlRegex.test(url)) {
    // Alert the user if the URL is not valid
    alert('Invalid URL. Please enter a valid URL.');
    return; // Exit the function early
  }
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
    inpt.value = url;
  } else {
    // If the URL parameter is not present, use the value of the `inpt` element.
    url = inpt.value.trim();
  }
  if (url !== '') {

    resultsDiv.classList.remove('none')
    shareBtn.classList.remove('none')
    secFrame.innerHTML = '';
    fetchIPAddress(url);
    timeDate();
    performCspHeaderTest(url)
    performXFrameOptionsTest(url)
    const iframe = secFrame.querySelector('iframe');
    if (iframe) {
      secFrame.innerHTML = `<iframe src="${url}" id="frame" frameborder="0"></iframe>`;
    } else {
      secFrame.innerHTML = `<iframe src="${url}" id="frame" frameborder="0"></iframe>`;
    }

    // Add a loading indicator.
    secFrame.classList.add('loading');
    secFrame.classList.add('container-100');
    document.getElementById('frame').onload = function() {secFrame.classList.remove('loading') }; // before setting 'src'
  } else {
    alert('Enter a URL');
  }
};

//share functionality
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
});

checkBtn.addEventListener('click', checkJack);

// Add this code to handle the query parameter on page load

inpt.addEventListener('keyup', (event) => {
  // Check if the Enter key (key code 13) is pressed
  if (event.key === 'Enter') {
    // Trigger a click on the button
    checkBtn.click();
  }
});


function timeDate() {
  const currentDate = new Date();
  var formattedDate = currentDate.toUTCString();
  resultsDivElems.time.innerHTML = formattedDate

}
const fetchIPAddress = async (url) => {
  try {
    // Make an HTTP request to the IPify API to get the IP address
    const response = await fetch(`https://api.ipify.org/?format=json&url=${encodeURIComponent(url)}`);
    const data = await response.json();
    const ipAddress = data.ip;

    // Display the IP address in the resultsDiv
    resultsDivElems.ip.innerHTML = ipAddress
  } catch (error) {
    console.error('Error fetching IP address:', error);

    // Check if the error message contains the CSP violation message
    if (error.message.includes('frame-ancestors')) {
    resultsDivElems.ip.innerHTML = `Not available due to CSP violation`
    } else {
    resultsDivElems.ip.innerHTML = ` Not available`
    }
  }
};


// Function to perform the X-Frame-Options test
const performXFrameOptionsTest = async (testUrl) => {
  try {
    // Use the CORS Anywhere proxy URL
    const corsProxyUrl = 'https://cors-anywhere.herokuapp.com/';

    // Make an HTTP request to the URL using the proxy
    const response = await fetch(corsProxyUrl + testUrl, { method: 'HEAD' });
    const headers = response.headers;

    // Check if the headers object is missing or if the X-Frame-Options header is missing
    if (!headers || !headers.has('X-Frame-Options')) {
      resultsDivElems.xFrame.innerHTML = 'Header Missing <img src="assets/red (1).png" alt="Header Missing" width="50">';
    } else if (headers.get('X-Frame-Options').includes('SAMEORIGIN')) {
      resultsDivElems.xFrame.innerHTML = 'Same origin <img src="assets/green.png" alt="Same origin" width="50">';
    } else {
      resultsDivElems.xFrame.innerHTML = 'Test Failed <img src="assets/red (1).png" alt="Test Failed" width="50">';
    }
  } catch (error) {
    console.error('X-Frame-Options test error:', error);
    // If there's an error during the fetch, treat it as a test failure
    resultsDivElems.xFrame.innerHTML = 'Test Failed <img src="assets/red (1).png" alt="Test Failed" width="50">';
  }
}

// Function to perform the CSP Header test
const performCspHeaderTest = async (testUrl) => {
  try {
    // Use the CORS Anywhere proxy URL
    const corsProxyUrl = 'https://cors-anywhere.herokuapp.com/';

    // Make an HTTP request to the URL using the proxy
    const response = await fetch(corsProxyUrl + testUrl, { method: 'HEAD' });
    const headers = response.headers;

    // Check if the CSP Header value allows framing from the same origin
    const cspHeader = headers.get('Content-Security-Policy');
    if (cspHeader.includes("frame-ancestors 'self'")) {
      resultsDivElems.Csp.innerHTML = `Test Passed <img src="assets/green.png" alt="Test Passed" width="50">`
    } else {
      resultsDivElems.Csp.innerHTML = 'Test Failed <img src="assets/red (1).png" alt="Test Failed" width="50">';
    }
  } catch (error) {
    console.error('CSP Header test error:', error);
    resultsDivElems.Csp.innerHTML = 'Test Failed <img src="assets/red (1).png" alt="Test Failed" width="50">';
  }
}


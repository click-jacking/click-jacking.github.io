const inpt = document.getElementById('inpt');
const checkBtn = document.getElementById('button-addon2');
const secFrame = document.getElementById('sec-frame');
const shareBtn = document.getElementById('share-btn');
const resultsDiv = document.getElementById('resultsDiv');
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
  resultsDiv.innerHTML = '';
  shareBtn.textContent = 'Share results';
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
    inpt.value = url;
  } else {
    // If the URL parameter is not present, use the value of the `inpt` element.
    url = inpt.value.trim();
  }
  if (url !== '') {
    resultsDiv.innerHTML = '';
    secFrame.innerHTML = '';
    fetchIPAddress(url);
    timeDate();
    performCspHeaderTest(url)
    performXFrameOptionsTest(url)
    document.getElementById('results').classList.remove('none');
    const iframe = secFrame.querySelector('iframe');
    if (iframe) {
      iframe.src = url;
    } else {
      secFrame.innerHTML = `<iframe src="${url}" frameborder="0"></iframe>`;
    }

    // Add a loading indicator.
    secFrame.classList.add('loading');
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
;

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

  // Append the current date and time to the resultsDiv
  resultsDiv.innerHTML += `<h4>Time: ${formattedDate}</h4>`;
}
const fetchIPAddress = async (url) => {
  try {
    // Make an HTTP request to the IPify API to get the IP address
    const response = await fetch('https://api.ipify.org/?format=json');
    const data = await response.json();
    const ipAddress = data.ip;

    // Display the IP address in the resultsDiv
    resultsDiv.innerHTML += `  <h4>IP Address: ${ipAddress} </h4>`;
  } catch (error) {
    console.error('Error fetching IP address:', error);

    // Check if the error message contains the CSP violation message
    if (error.message.includes('frame-ancestors')) {
      resultsDiv.innerHTML += '  <h4> IP Address: Not available due to CSP violation </h4>';
    } else {
      resultsDiv.innerHTML += '  <h4>IP Address: Not available</h4>';
    }
  }
};

// Function to perform the CSP Header (Frame-Ancestors) test
const performCspHeaderTest = async (testUrl) => {
  try {
    // Make an HTTP request to the URL to get the HTTP headers
    const response = await fetch(testUrl, { method: 'HEAD' });
    const headers = response.headers;

    // Check if the CSP Header value allows framing
    const cspHeader = headers.get('Content-Security-Policy');
    if (cspHeader.includes("frame-ancestors 'none'")) {
      resultsDiv.innerHTML += ' <h4>CSP Header (Frame-Ancestors): Test Passed <img src="assets/green.png" alt="Test Passed" width="50"></h4>';
    } else {
      resultsDiv.innerHTML += ' <h4>CSP Header (Frame-Ancestors): Test Failed <img src="assets/red (1).png" alt="Test Failed" width="50"></h4>';
    }
  } catch (error) {
    console.error('CSP Header test error:', error);
    resultsDiv.innerHTML += ' <h4>CSP Header (Frame-Ancestors): Test Failed <img src="assets/red (1).png" alt="Test Failed" width="50"> </h4>';
  }
}

// Function to perform the X-Frame-Options test
const performXFrameOptionsTest = async (testUrl) => {
  try {
    // Make an HTTP request to the URL to get the HTTP headers
    const response = await fetch(testUrl, { method: 'HEAD' });
    const headers = response.headers;

    // Check if the X-Frame-Options header allows framing
    const xFrameOptions = headers.get('X-Frame-Options');
    if (!xFrameOptions || !xFrameOptions.includes('DENY') && !xFrameOptions.includes('SAMEORIGIN')) {
      resultsDiv.innerHTML += ' <h4>X-Frame-Options: Test Passed <img src="assets/green.png" alt="Test Passed" width="50"></h4>';
    } else {
      resultsDiv.innerHTML += ` <h4>X-Frame-Options: Test Failed <img src="assets/red (1).png" alt="Test Failed" width="50"></h4>`;
    }
  } catch (error) {
    console.error('X-Frame-Options test error:', error);
    resultsDiv.innerHTML += ' <h4>X-Frame-Options: Test Failed <img src="assets/red (1).png" alt="Test Failed" width="50"></h4>';
  }
}
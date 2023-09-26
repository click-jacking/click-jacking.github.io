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
    inpt.value = url; // Populate the input field with the session storage value
  } else {
    // If the URL parameter is not present, use the value of the `inpt` element.
    url = inpt.value.trim();
  }

  if (url !== '') {
    secFrame.innerHTML = ''; // Clear the iframe content
    fetchIPAddress(url);
    timeDate();
    shareBtn.classList.remove('none');
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
window.addEventListener('load', () => {
  const urlParam = new URLSearchParams(window.location.search).get('url');
  if (urlParam) {
    // Set the input field value to the URL query parameter.
    inpt.value = decodeURIComponent(urlParam);

    // Call the checkJack function to use the URL from the query parameter.
    checkJack();

    // Call the performTests function to run all tests including X-Frame-Options.
    performTests();
  }
});

inpt.addEventListener('keyup', (event) => {
  // Check if the Enter key (key code 13) is pressed
  if (event.key === 'Enter') {
    // Trigger a click on the button
    checkBtn.click();
  }
});

// Now you can use the url variable here
const resultsDiv = document.getElementById('resultsDiv'); // Get the results div

function timeDate() {
  // Get the current date and time
  const currentDate = new Date();
  var formattedDate = currentDate.toUTCString();

  // Append the current date and time to the resultsDiv
  resultsDiv.innerHTML += `<br><h4>Time: ${formattedDate}</h4>`;
}

// Function to perform the CSP Header (Frame-Ancestors) test
function performCspHeaderTest() {
  performXFrameOptionsTest()
  try {
    // Assuming you have a function to get the CSP Header value
    const cspHeader = getCSHeaderValue();

    // Check if the CSP Header value allows framing
    if (cspHeader.includes("frame-ancestors 'none'")) {
      resultsDiv.innerHTML += '<h4>CSP Header (Frame-Ancestors): Test Passed <img src="assets/green.png" alt="Test Passed" width="50"></h4>';
    } else {
      resultsDiv.innerHTML += '<h4>CSP Header (Frame-Ancestors): Test Failed <img src="assets/red (1).png" alt="Test Failed" width="50"></h4>';
    }
  } catch (error) {
    console.error('CSP Header test error:', error);
    resultsDiv.innerHTML += '<h4>CSP Header (Frame-Ancestors): Test Failed <img src="assets/red (1).png" alt="Test Failed" width="50"> </h4>';
  }
}

// Function to fetch the IP address of the website.
const fetchIPAddress = async (url) => {
  try {
    // Make an HTTP request to a service that can provide the IP address
    const response = await fetch(url);
    const data = await response.json();
    const ipAddress = data.ip;

    // Display the IP address in the resultsDiv
    resultsDiv.innerHTML += `<h4> IP Address: ${ipAddress} </h4>`;

  } catch (error) {

    console.error('Error fetching IP address:', error);

    // Check if the error message contains the CSP violation message
    if (error.message.includes('frame-ancestors')) {
      resultsDiv.innerHTML += '<h4> IP Address: Not available due to CSP violation </h4>';
    } else {
      resultsDiv.innerHTML += '<h4>IP Address: Not available</h4>';
    }
  }
}

// Function to perform the tests and display results
const performTests = () => {
  performXFrameOptionsTest();
  performCspHeaderTest(); // Perform CSP Header test as well
  // Clear the resultsDiv before performing tests
  resultsDiv.innerHTML = '';

  // Get the URL to test from the input field or query parameter
  const urlParam = new URLSearchParams(window.location.search).get('url');
  const url = urlParam || inpt.value.trim();

  if (url !== '') {
    // Perform the CSP Header (Frame-Ancestors) test
    performCspHeaderTest();

    // Fetch and display the IP address
    // fetchIPAddress(url);

    // Get the current date and time and display it
    timeDate();
  } else {
    alert('Enter a URL');
  }
};

// Add a click event listener to the checkBtn to trigger the tests
checkBtn.addEventListener('click', performTests);

// Add a keyup event listener to the input field to trigger the tests when Enter is pressed
inpt.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    performTests();
  }
});

// Function to perform the X-Frame-Options test
function performXFrameOptionsTest() {
  try {
    const headers = new Headers();
    headers.append('X-Frame-Options', 'ALLOW-FROM ' + url); // Assuming the 'ALLOW-FROM' value is set properly in your server response headers.

    // Check if X-Frame-Options allow framing from the specified URL
    if (headers.has('X-Frame-Options') && headers.get('X-Frame-Options').includes(url)) {
      resultsDiv.innerHTML += '<h4>X-Frame-Options: Test Passed <img src="assets/green.png" alt="Test Passed" width="50"></h4>';
    } else {
      resultsDiv.innerHTML += '<h4>X-Frame-Options: Test Failed <img src="assets/red.png" alt="Test Failed" width="50"></h4>';
    }
  } catch (error) {
    console.error('X-Frame-Options test error:', error);
    resultsDiv.innerHTML += '<h4>X-Frame-Options: Test Failed <img src="assets/red.png" alt="Test Failed" width="50"></h4>';
  }
}

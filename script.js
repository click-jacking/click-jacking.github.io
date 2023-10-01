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
    inpt.value = decodeURIComponent(urlParam);
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
  url = new URLSearchParams(window.location.search).get('url');
  const urlRegex = /^(https?:\/\/)?([\w.-]+)(\/[^\s]*)?$/;
  if (!urlRegex.test(url)) {
    alert('Invalid URL. Please enter a valid URL.');
    return;
  }
  if (url) {
    const inputValue = inpt.value.trim();
    updateSessionStorage(inputValue);
    const currentURL = new URL(window.location.href);
    currentURL.searchParams.delete('url');
    history.pushState(null, '', currentURL.toString());
    url = getSessionStorageInputValue();
    inpt.value = url;
  } else {
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
    secFrame.classList.add('loading');
    secFrame.classList.add('container-100');
    document.getElementById('frame').onload = function() {secFrame.classList.remove('loading') }; // before setting 'src'
  } else {
    alert('Enter a URL');
  }
};
shareBtn.addEventListener('click', () => {
  const currentURL = new UL(window.location.href);
  const inputValue = inpt.value.trim();
  if (currentURL.searchParams.has('url')) {
    navigator.clipboard.writeText(currentURL.toString());
  } else {
    currentURL.searchParams.set('url', inputValue);
    navigator.clipboard.writeText(currentURL.toString());
    updateSessionStorage(inputValue);
  }
  shareBtn.textContent = 'Copied ✔';
});
checkBtn.addEventListener('click', checkJack);
inpt.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
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
    const response = await fetch(`https://api.ipify.org/?format=json&url=${encodeURIComponent(url)}`);
    const data = await response.json();
    const ipAddress = data.ip;
    resultsDivElems.ip.innerHTML = ipAddress
  } catch (error) {
    resultsDivElems.ip.innerHTML = ` Not available`
  }};
const performXFrameOptionsTest = async (testUrl) => {
  try {
    const corsProxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const response = await fetch(corsProxyUrl + testUrl, { method: 'HEAD' });
    const headers = response.headers;
    if (!headers || !headers.has('X-Frame-Options')) {
      resultsDivElems.xFrame.innerHTML = 'Header Missing <img src="assets/red.webp" alt="Header Missing" width="50">';
    } else if (headers.get('X-Frame-Options').includes('SAMEORIGIN')) {
      resultsDivElems.xFrame.innerHTML = 'Same origin <img src="assets/green.webp" alt="Same origin" width="50">';
    } else {
      resultsDivElems.xFrame.innerHTML = 'Test Failed <img src="assets/red.webp" alt="Test Failed" width="50">';
    }
  } catch (error) {
    console.error('X-Frame-Options test error:', error);
    resultsDivElems.xFrame.innerHTML = 'Test Missing <img src="assets/green.webp" alt="Test Failed" width="50">';
  }}
const performCspHeaderTest = async (testUrl) => {
  try {
    const corsProxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const response = await fetch(corsProxyUrl + testUrl, { method: 'HEAD' });
    const headers = response.headers;
     const cspHeader = headers.get('Content-Security-Policy');
    if (cspHeader.includes("frame-ancestors 'self'")) {
      resultsDivElems.Csp.innerHTML = `Test Passed <img src="assets/green.webp" alt="Test Passed" width="50">`
    } else {
      resultsDivElems.Csp.innerHTML = 'Test Failed <img src="assets/red.webp" alt="Test Failed" width="50">';
    }
  } catch (error) {
    console.error('CSP Header test error:', error);
    resultsDivElems.Csp.innerHTML = 'Test Resited <img src="assets/red.webp" alt="Test Failed" width="50">';
  }}
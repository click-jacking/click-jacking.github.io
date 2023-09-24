const inpt = document.getElementById('inpt');
const checkBtn = document.getElementById('button-addon2');
const secFrame = document.getElementById('sec-frame');

const checkJack = function () {
    const url = inpt.value;
if(url.trim()!==''){
    const iframe = secFrame.querySelector('iframe');
    if (iframe && iframe.sandbox && iframe.sandbox.contains('allow-scripts')) {
        let msg = document.createElement('h4')
        msg.innerHTML = 'Your site has click jacking enabled ❌'
        secFrame.appendChild(msg)
  } else {
      let msg = document.createElement('h4')
      msg.innerHTML = 'This site is safe ✅'
      secFrame.appendChild(msg)
  }
  secFrame.innerHTML = `<iframe src="${url}" frameborder="0"></iframe>`;
}else{
    alert('Enter a URL')
}
};

checkBtn.addEventListener('click', checkJack);

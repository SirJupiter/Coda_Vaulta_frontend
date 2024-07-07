function downloadImage(element) {
  html2canvas(element)
    .then((canvas) => {
      const dataURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'image.png';
      link.click();
    })
    .catch((error) => {
      console.error('Error capturing image:', error);
    });
}

// const componentElement = document.getElementById('my-component');
// const downloadButton = document.getElementById('download-button');

// downloadButton.addEventListener('click', () => downloadImage(componentElement));

document
  .querySelector('.toggle-password1')
  .addEventListener('click', function () {
    // Toggle the type attribute
    const password = document.querySelector('.password1');
    const type =
      password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);

    // Toggle the eye / eye-slash icon
    this.classList.toggle('fa-eye-slash');
  });

document
  .querySelector('.toggle-password2')
  .addEventListener('click', function () {
    // Toggle the type attribute
    const password = document.querySelector('.password2');
    const type =
      password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);

    // Toggle the eye / eye-slash icon
    this.classList.toggle('fa-eye-slash');
  });

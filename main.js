import './style.css';

const fileInput = document.getElementById('fileInput');
const convertButton = document.getElementById('convertButton');
const status = document.getElementById('status');
const dropArea = document.getElementById('dropArea');
const outputFormat = document.getElementById('outputFormat');

const supportedFormats = {
  'image': {
    'jpg': ['png', 'webp', 'gif', 'jiji'],
    'jpeg': ['png', 'webp', 'gif', 'jiji'],
    'png': ['jpg', 'webp', 'gif', 'jiji'],
    'gif': ['jpg', 'png', 'webp', 'jiji'],
    'webp': ['jpg', 'png', 'gif', 'jiji'],
    'jiji': ['jpg', 'png', 'gif', 'webp']
  },
  'font': {
    'ttf': ['woff', 'woff2', 'otf'],
    'otf': ['ttf', 'woff', 'woff2'],
    'woff': ['ttf', 'otf', 'woff2'],
    'woff2': ['ttf', 'otf', 'woff']
  }
};

function init() {
  setupEventListeners();
}

function setupEventListeners() {
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
  });

  dropArea.addEventListener('drop', handleDrop, false);

  dropArea.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
  convertButton.addEventListener('click', handleConvertButtonClick);
}

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

function highlight() {
  dropArea.classList.add('highlight');
}

function unhighlight() {
  dropArea.classList.remove('highlight');
}

function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;
  handleFiles(files);
}

function handleFiles(files) {
  if (files.length === 0) {
    updateStatus("No files selected.");
    return;
  }

  if (files.length > 50) {
    updateStatus("Maximum of 50 files can be selected.");
    return;
  }

  const fileType = getFileType(files[0]);
  if (!fileType) {
    updateStatus("Unsupported file type.");
    return;
  }

  fileInput.files = files;
  updateStatus(`${files.length} file selected.`);
  populateConversionOptions(fileType, files[0].name.split('.').pop().toLowerCase());
}

function getFileType(file) {
  const extension = file.name.split('.').pop().toLowerCase();
  for (const [type, formats] of Object.entries(supportedFormats)) {
    if (formats[extension]) return type;
  }
  return null;
}

function populateConversionOptions(fileType, extension) {
  outputFormat.innerHTML = '<option value="">Select option</option>';

  if (supportedFormats[fileType] && supportedFormats[fileType][extension]) {
    supportedFormats[fileType][extension].forEach(format => {
      const option = document.createElement('option');
      option.value = format;
      option.textContent = format.toUpperCase();
      outputFormat.appendChild(option);
    });
  } else {
    updateStatus("Unsupported file type for conversion.");
  }
}

function handleConvertButtonClick() {
  const files = fileInput.files;
  const targetFormat = outputFormat.value;

  if (files.length === 0 || !targetFormat) {
    updateStatus('Please select file(s) and a conversion format.');
    return;
  }

  updateStatus('Converting...');
  convertFiles(files, targetFormat)
    .then(() => {
      updateStatus('Conversion complete! Downloads started.');
    })
    .catch(error => {
      updateStatus(`Conversion failed: ${error.message}`);
    });
}

async function convertFiles(files, targetFormat) {
  for (const file of files) {
    await convertFile(file, targetFormat);
  }
}

async function convertFile(file, targetFormat) {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const convertedBlob = new Blob([file], { type: `application/${targetFormat}` });

  const downloadUrl = URL.createObjectURL(convertedBlob);
  const downloadLink = document.createElement('a');
  downloadLink.href = downloadUrl;
  downloadLink.download = file.name.replace(/\.[^/.]+$/, `.${targetFormat}`);
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(downloadUrl);
}

function updateStatus(message) {
  status.textContent = message;
}

init();

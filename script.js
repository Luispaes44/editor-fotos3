const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let img = new Image();
let drawing = false;
let history = [];
let historyIndex = -1;

// Sliders e inputs
const brightness = document.getElementById("brightness");
const contrast = document.getElementById("contrast");
const saturation = document.getElementById("saturation");
const brightnessVal = document.getElementById("brightnessVal");
const contrastVal = document.getElementById("contrastVal");
const saturationVal = document.getElementById("saturationVal");
const penColor = document.getElementById("penColor");
const penSize = document.getElementById("penSize");

// Upload imagem
document.getElementById("upload").addEventListener("change", function(e){
  const reader = new FileReader();
  reader.onload = function(event){
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      saveState();
      drawImage();
      updateThumbnails();
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(e.target.files[0]);
});

// Desenho
canvas.addEventListener('mousedown', () => drawing = true);
canvas.addEventListener('mouseup', () => { drawing = false; saveState(); });
canvas.addEventListener('mousemove', (e) => {
  if(!drawing) return;
  ctx.fillStyle = penColor.value;
  ctx.beginPath();
  ctx.arc(e.offsetX, e.offsetY, penSize.value, 0, Math.PI*2);
  ctx.fill();
});

// Sliders
[brightness, contrast, saturation].forEach(slider => {
  slider.addEventListener('input', drawImage);
});
brightness.addEventListener('input', () => brightnessVal.textContent = brightness.value);
contrast.addEventListener('input', () => contrastVal.textContent = contrast.value);
saturation.addEventListener('input', () => saturationVal.textContent = saturation.value);

// Funções
function drawImage(filter="none"){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.filter = `brightness(${brightness.value}%) contrast(${contrast.value}%) saturate(${saturation.value}%) ${filter}`;
  ctx.drawImage(img,0,0);
}

function applyFilter(filter){
  drawImage(filter);
  saveState();
}

// Undo
function saveState(){
  if(historyIndex < history.length-1) history = history.slice(0, historyIndex+1);
  history.push(canvas.toDataURL());
  historyIndex++;
}

function undo(){
  if(historyIndex <= 0) return;
  historyIndex--;
  const imgUndo = new Image();
  imgUndo.onload = () => ctx.drawImage(imgUndo,0,0);
  imgUndo.src = history[historyIndex];
}

// Girar imagem
function rotateImage(deg){
  const radians = deg * Math.PI/180;
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  tempCtx.drawImage(canvas,0,0);

  canvas.width = tempCanvas.height;
  canvas.height = tempCanvas.width;

  ctx.save();
  ctx.translate(canvas.width/2,canvas.height/2);
  ctx.rotate(radians);
  ctx.drawImage(tempCanvas,-tempCanvas.width/2,-tempCanvas.height/2);
  ctx.restore();
  saveState();
}

// Adicionar texto
function addText(){
  const text = prompt("Digite o texto:");
  if(!text) return;
  ctx.font = "40px Arial";
  ctx.fillStyle = penColor.value;
  ctx.fillText(text,50,50);
  saveState();
}

// Download
function downloadImage(){
  const link = document.createElement("a");
  link.download = "foto-editada.png";
  link.href = canvas.toDataURL();
  link.click();
}

// Thumbnails de filtros
function updateThumbnails(){
  document.querySelectorAll('.filter-thumbs canvas').forEach(thumb => {
    const thumbCtx = thumb.getContext('2d');
    thumb.width = 50;
    thumb.height = 50;
    thumbCtx.filter = thumb.dataset.filter;
    thumbCtx.drawImage(img,0,0,50,50);
    thumb.onclick = () => applyFilter(thumb.dataset.filter);
  });
}
  

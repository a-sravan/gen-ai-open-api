document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const imagePreview = document.getElementById('imagePreview');
    const previewArea = document.querySelector('.preview-area');
    const resultPanel = document.querySelector('.result-panel');
    const resultText = document.getElementById('resultText');
    const loadingOverlay = document.querySelector('.loading-overlay');
    const copyBtn = document.getElementById('copyBtn');
    const fileInfo = document.querySelector('.file-info');
    const fileName = document.querySelector('.file-name');
    const fileSize = document.querySelector('.file-size');

    // Utility Functions
    const bytesToSize = (bytes) => {
        const sizes = ['Bytes', 'KB', 'MB'];
        if (bytes === 0) return '0 Byte';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(100 * (bytes / Math.pow(1024, i))) / 100 + ' ' + sizes[i];
    };

    const showToast = (message, isError = true) => {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.style.background = isError ? 'var(--error-color)' : 'var(--success-color)';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    };

    const setLoading = (isLoading) => {
        loadingOverlay.classList.toggle('hidden', !isLoading);
        analyzeBtn.disabled = isLoading;
    };

    // File Validation
    const validateFile = (file) => {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
            showToast('Please upload a valid image file (PNG, JPG, or JPEG)');
            return false;
        }

        if (file.size > maxSize) {
            showToast('File size must be less than 5MB');
            return false;
        }

        return true;
    };

    // File Handler
    const handleFile = (file) => {
        if (!validateFile(file)) return;

        // Update file info
        fileName.textContent = file.name;
        fileSize.textContent = bytesToSize(file.size);
        fileInfo.classList.remove('hidden');

        // Preview image
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            previewArea.classList.remove('hidden');
            analyzeBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    };

    // Event Listeners
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    });

    dropZone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleFile(file);
    });

    // Handle paste events
    document.addEventListener('paste', (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let item of items) {
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                handleFile(file);
                break;
            }
        }
    });

    // Analyze Image
    analyzeBtn.addEventListener('click', async () => {
        const formData = new FormData();
        const file = fileInput.files[0];
        if (!file) return;

        formData.append('file', file);
        setLoading(true);

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Server error');
            }

            resultText.textContent = data.result;
            resultPanel.classList.remove('hidden');
            showToast('Analysis complete!', false);
        } catch (error) {
            showToast(error.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    });

    // Copy to clipboard
    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(resultText.textContent);
            showToast('Copied to clipboard!', false);
        } catch (err) {
            showToast('Failed to copy text');
        }
    });

    // Keyboard Accessibility
    dropZone.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInput.click();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const toast = document.getElementById('toast');
            if (toast.classList.contains('show')) {
                toast.classList.remove('show');
            }
        }
    });
});

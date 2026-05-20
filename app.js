// State Management
let serviceItems = [];
let proposalTasks = [];

// Navigation Logic
const navButtons = document.querySelectorAll('.btn-nav');
const views = document.querySelectorAll('.view-section');

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        
        // Tüm görünümleri gizle
        views.forEach(view => {
            view.classList.add('hidden');
            view.classList.remove('active');
        });

        // Hedef görünümü göster
        const targetView = document.getElementById(targetId);
        if (targetView) {
            targetView.classList.remove('hidden');
            targetView.classList.add('active');
            
            // Proposal sayfasına geçildiğinde dropdown'ı güncelle (yeni eklenenler olabilir)
            if (targetId === 'proposal-view') {
                updateSelectDropdown();
            }
        }
    });
});

// DOM Elements - Input Form
const itemForm = document.getElementById('item-form');
const itemNameInput = document.getElementById('item-name');
const itemUnitInput = document.getElementById('item-unit');
const itemPriceInput = document.getElementById('item-price');
const savedItemsList = document.getElementById('saved-items-list');

// DOM Elements - Proposal Form
const taskForm = document.getElementById('task-form');
const selectItem = document.getElementById('select-item');
const taskQuantity = document.getElementById('task-quantity');
const quantityLabel = document.getElementById('quantity-label');
const proposalBody = document.getElementById('proposal-body');
const grandTotalEl = document.getElementById('grand-total');
const printBtn = document.getElementById('print-btn');

// 1. Yeni Hizmet Kalemi Ekleme
itemForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = itemNameInput.value.trim();
    const unit = itemUnitInput.value.trim();
    const price = parseFloat(itemPriceInput.value);

    if (name && unit && !isNaN(price)) {
        const newItem = {
            id: Date.now().toString(),
            name,
            unit,
            price
        };

        serviceItems.push(newItem);
        updateSavedItemsUI();
        
        // Formu temizle
        itemForm.reset();
        itemNameInput.focus();
    }
});

function updateSavedItemsUI() {
    savedItemsList.innerHTML = '';
    
    if (serviceItems.length === 0) {
        savedItemsList.innerHTML = '<li><span style="color:#999; font-style:italic;">Henüz kalem eklenmedi.</span></li>';
        return;
    }

    serviceItems.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${item.name} <span style="color:#666; font-size:0.8rem;">(${item.unit})</span></span>
            <span class="item-badge">${item.price.toLocaleString('tr-TR')} TL</span>
        `;
        savedItemsList.appendChild(li);
    });
}

function updateSelectDropdown() {
    // Dropdown'ı temizle
    selectItem.innerHTML = '<option value="" disabled selected>Hizmet seçin...</option>';
    
    if (serviceItems.length === 0) {
        selectItem.innerHTML = '<option value="" disabled selected>Önce veri girişi sayfasından kalem ekleyin...</option>';
        return;
    }

    serviceItems.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = `${item.name} (${item.price} TL / ${item.unit})`;
        selectItem.appendChild(option);
    });
}

// Seçili kaleme göre miktar label'ını güncelleme
selectItem.addEventListener('change', () => {
    const selectedId = selectItem.value;
    const item = serviceItems.find(i => i.id === selectedId);
    if (item) {
        quantityLabel.textContent = `Miktar (${item.unit})`;
        taskQuantity.focus();
    }
});

// 2. Teklife İşlem Ekleme
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const selectedId = selectItem.value;
    const quantity = parseFloat(taskQuantity.value);

    if (!selectedId) {
        alert('Lütfen bir hizmet kalemi seçin.');
        return;
    }

    if (isNaN(quantity) || quantity <= 0) {
        alert('Lütfen geçerli bir miktar girin.');
        return;
    }

    const item = serviceItems.find(i => i.id === selectedId);
    
    if (item) {
        const total = item.price * quantity;
        
        const newTask = {
            taskId: Date.now().toString(),
            item: item,
            quantity: quantity,
            total: total
        };

        proposalTasks.push(newTask);
        updateProposalUI();

        // Formu temizle
        selectItem.value = '';
        taskQuantity.value = '';
        quantityLabel.textContent = 'Miktar';
    }
});

function removeTask(taskId) {
    proposalTasks = proposalTasks.filter(task => task.taskId !== taskId);
    updateProposalUI();
}

function updateProposalUI() {
    proposalBody.innerHTML = '';
    let grandTotal = 0;

    if (proposalTasks.length === 0) {
        proposalBody.innerHTML = `<tr><td colspan="5" class="empty-state">Henüz teklife işlem eklenmedi.</td></tr>`;
        grandTotalEl.textContent = '0.00 TL';
        return;
    }

    proposalTasks.forEach(task => {
        grandTotal += task.total;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${task.item.name}</strong></td>
            <td>${task.quantity} ${task.item.unit}</td>
            <td>${task.item.price.toLocaleString('tr-TR')} TL</td>
            <td style="color:var(--primary-dark); font-weight:bold;">${task.total.toLocaleString('tr-TR')} TL</td>
            <td>
                <button type="button" class="btn btn-delete" onclick="removeTask('${task.taskId}')" title="Sil">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </button>
            </td>
        `;
        proposalBody.appendChild(tr);
    });

    grandTotalEl.textContent = `${grandTotal.toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2})} TL`;
}

// DOM Elements - Export Buttons
const exportPdfBtn = document.getElementById('export-pdf');
const exportWordBtn = document.getElementById('export-word');

// 3. Yazdırma ve Dışa Aktarma İşlemleri
printBtn.addEventListener('click', () => {
    if (proposalTasks.length === 0) {
        alert('Yazdırılacak bir teklif bulunmuyor. Lütfen önce işlem ekleyin.');
        return;
    }
    window.print();
});

exportPdfBtn.addEventListener('click', () => {
    if (proposalTasks.length === 0) {
        alert('Dışa aktarılacak bir teklif bulunmuyor.');
        return;
    }
    
    const proposalContent = document.getElementById('proposal-view');
    
    // Geçici olarak gizlenecek elemanlar
    const exportButtons = document.querySelector('.export-buttons');
    const backBtn = document.querySelector('#proposal-view .btn-back');
    const form = document.getElementById('task-form');
    // Tablodaki işlem sütununu gizle
    const actionHeaders = document.querySelectorAll('#proposal-table th:last-child');
    const actionCells = document.querySelectorAll('#proposal-table td:last-child');
    
    // PDF'te görünmesi için yazdırma başlığı ve alt bilgisini aç
    const printHeader = document.querySelector('.print-header');
    const printFooter = document.querySelector('.print-footer');
    
    exportButtons.style.display = 'none';
    backBtn.style.display = 'none';
    form.style.display = 'none';
    actionHeaders.forEach(th => th.style.display = 'none');
    actionCells.forEach(td => td.style.display = 'none');
    printHeader.style.display = 'flex';
    printFooter.style.display = 'flex';

    const opt = {
        margin:       10,
        filename:     'Teklif.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(proposalContent).save().then(() => {
        // Elemanları eski haline getir
        exportButtons.style.display = 'flex';
        backBtn.style.display = 'inline-flex';
        form.style.display = 'block';
        actionHeaders.forEach(th => th.style.display = '');
        actionCells.forEach(td => td.style.display = '');
        printHeader.style.display = '';
        printFooter.style.display = '';
    });
});

exportWordBtn.addEventListener('click', () => {
    if (proposalTasks.length === 0) {
        alert('Dışa aktarılacak bir teklif bulunmuyor.');
        return;
    }
    
    let table = document.getElementById("proposal-table");
    let cloneTable = table.cloneNode(true);
    
    // Sil butonlarının olduğu son sütunu kaldır
    let theadRows = cloneTable.querySelectorAll('thead tr');
    theadRows.forEach(row => { if(row.children.length > 0) row.removeChild(row.lastElementChild); });
    let tbodyRows = cloneTable.querySelectorAll('tbody tr');
    tbodyRows.forEach(row => { if(row.children.length > 0) row.removeChild(row.lastElementChild); });

    let html = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>Teklif</title>
        <style>
            body { font-family: 'Arial', sans-serif; }
            table.layout-table { width: 100%; border: none; margin-bottom: 20px; }
            table.layout-table td { border: none; padding: 0; vertical-align: top; }
            table.data-table { border-collapse: collapse; width: 100%; margin-top: 20px; margin-bottom: 20px; }
            table.data-table th, table.data-table td { border: 1px solid #dddddd; padding: 10px; text-align: left; }
            table.data-table th { background-color: #f2f2f2; }
            h1 { color: #2e7d32; font-size: 24px; margin-bottom: 5px; }
            h2 { font-size: 20px; margin-bottom: 15px; }
            .total { text-align: right; font-weight: bold; margin-top: 20px; font-size: 1.2em; }
            .signature-line { margin-top: 40px; border-top: 1px solid #000; width: 200px; }
        </style>
        </head><body>
        <table class="layout-table">
            <tr>
                <td>
                    <h1>GüneySu Garten</h1>
                    <p><strong>Yusuf Güneysu</strong></p>
                    <p>Herrenwaldstraße 5<br>67063 Ludwigshafen<br>Tel: 017672306251<br>E-posta: ygueneysu@hotmail.de</p>
                </td>
                <td style="text-align: right;">
                    <h2>TEKLİF FORMU</h2>
                    <p>Tarih: ............................................</p>
                    <p>Müşteri: ............................................</p>
                    <p>Adres: ............................................</p>
                </td>
            </tr>
        </table>
        ${cloneTable.outerHTML.replace('<table', '<table class="data-table"')}
        <div class="total">Genel Toplam: ${document.getElementById('grand-total').textContent}</div>
        <table class="layout-table" style="margin-top: 50px;">
            <tr>
                <td>Bizi tercih ettiğiniz için teşekkür ederiz. İşbu teklif bilgilendirme amaçlıdır.</td>
                <td style="text-align: right;">
                    Müşteri Onayı / İmza<br>
                    ...................................................
                </td>
            </tr>
        </table>
        </body></html>
    `;

    let url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html);
    let downloadLink = document.createElement("a");
    document.body.appendChild(downloadLink);
    downloadLink.href = url;
    downloadLink.download = 'Teklif.doc';
    downloadLink.click();
    document.body.removeChild(downloadLink);
});

// Başlangıç Durumu
updateSavedItemsUI();
updateSelectDropdown();
updateProposalUI();

// Service Worker Registration for PWA / APK
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => console.log('SW registered'))
            .catch(err => console.log('SW registration failed:', err));
    });
}

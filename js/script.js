let allData = [];

function fetchData() {
    fetch('proxy.php')
        .then(response => response.text())
        .then(html => {
            extractDataFromHTML(html);
            // Menyembunyikan pesan loading setelah data dimuat
            document.getElementById('loading-message').style.display = 'none';
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            displayError('Gagal memuat data. Silakan coba lagi.');
            document.getElementById('loading-message').style.display = 'none'; // Menyembunyikan pesan loading jika gagal
        });
}

function cleanData(data) {
    return data.replace(/document\.write\(['"](.+?)['"]\);/g, '$1');
}

function extractDataFromHTML(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const tableWrappers = doc.querySelectorAll('.tablewrapper');
    const tablesContainer = document.getElementById('tables-container');
    tablesContainer.innerHTML = '';

    tableWrappers.forEach((wrapper, index) => {
        const table = wrapper.querySelector('.tabel');
        const headerText = table.querySelector('tr.head > td') ? cleanData(table.querySelector('tr.head > td').textContent) : 'Produk Baru';
        const rows = table.querySelectorAll('tr.td1, tr.td2');
        
        const tableElement = createTable(headerText, rows);
        const tableWrapperDiv = document.createElement('div');
        tableWrapperDiv.classList.add('tablewrapper');
        tableWrapperDiv.appendChild(tableElement);

        tablesContainer.appendChild(tableWrapperDiv);
    });
}

function createTable(headerText, rows) {
    const table = document.createElement('table');
    table.classList.add('tabel');

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headerCell = document.createElement('td');
    headerCell.colSpan = 4;
    headerCell.classList.add('center', 'last');
    headerCell.style.backgroundColor = '#4784a5';
    headerCell.style.color = '#ffffff';
    headerCell.textContent = headerText;
    headerRow.appendChild(headerCell);
    thead.appendChild(headerRow);

    const columnHeaderRow = document.createElement('tr');
    columnHeaderRow.innerHTML = `
        <td class="center" style="width: 20%">Kode</td>
        <td class="center" style="width: 40%">Keterangan</td>
        <td class="center" style="width: 20%">Harga</td>
        <td class="center last" style="width: 20%">Status</td>
    `;
    thead.appendChild(columnHeaderRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 4) return;

        const kode = cleanData(cells[0].textContent || 'N/A');
        const keterangan = cleanData(cells[1].textContent || 'N/A');
        const harga = cleanData(cells[2].textContent || 'N/A');
        const status = cleanData(cells[3].textContent || 'N/A');

        const rowElement = document.createElement('tr');

        const cell1 = document.createElement('td');
        const cell2 = document.createElement('td');
        const cell3 = document.createElement('td');
        const cell4 = document.createElement('td');

        cell1.textContent = kode;
        cell2.textContent = keterangan;
        cell3.textContent = harga;

        const badge = document.createElement('span');
        badge.className = 'badge ' + (status.trim().toLowerCase() === 'open' ? 'badge-success' : 'badge-danger');
        badge.textContent = status.trim();
        cell4.appendChild(badge);

        rowElement.appendChild(cell1);
        rowElement.appendChild(cell2);
        rowElement.appendChild(cell3);
        rowElement.appendChild(cell4);

        tbody.appendChild(rowElement);
    });

    table.appendChild(tbody);

    return table;
}

function displayError(message) {
    const errorMessageElement = document.getElementById('error-message');
    errorMessageElement.textContent = message;
}

function filterData() {
    const query = document.getElementById('search-box').value.toLowerCase();
    const tables = document.querySelectorAll('.tabel');

    tables.forEach(table => {
        const rows = table.querySelectorAll('tbody tr');
        let hasMatchingRow = false;

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const matchesQuery = Array.from(cells).some(cell => cell.textContent.toLowerCase().includes(query));

            if (matchesQuery) {
                row.style.display = '';
                hasMatchingRow = true;
            } else {
                row.style.display = 'none';
            }
        });

        const tableWrapper = table.closest('.tablewrapper');
        if (hasMatchingRow) {
            tableWrapper.style.display = '';
        } else {
            tableWrapper.style.display = 'none';
        }
    });
}

window.onload = function() {
    fetchData();
    setInterval(fetchData, 60000);
};

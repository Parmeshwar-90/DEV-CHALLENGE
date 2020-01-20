const url = "ws://localhost:8011/stomp";
const client = Stomp.client(url);
var sparkLineArray = [];
var tableName = 'currency-data-table';
var currencyData = [];
var subscription;

client.connect({}, connectToFxPrices, function (error) {
    client.unsubscribe(subscription);
});

function connectToFxPrices() {
    subscription = client.subscribe("/fx/prices",
        function (message) {
            handleData(message);
        }
    );
}

function handleData(message) {
    if (message.body) {
        let data = message.body
        manageRecievedData(JSON.parse(data));
    } else {
        console.log('data is not recieved');
    }
}

function manageRecievedData(data) {
    let table = document.getElementById(tableName);
    let index = currencyData.findIndex((x) => {
        return x.name == data.name;
    });
    if (index > -1) {
        updateTableRow(data, index);
    } else {
        currencyData.push(data);
        addTableRow(data, table);
    }
}

function addTableRow(data, target) {

    let rowCount = target.rows.length - (target.rows.length - 1);
    let row = target.insertRow(rowCount);
    const name = createElement('td');
    const currentBestBid = createElement('td');
    const currentBestAsk = createElement('td');
    const lastChangeBid = createElement('td');
    const lastChangeAsk = createElement('td');
    const sparkLine = createElement('td');
    const sparks = createElement('span');
    renderSparkline(data.bestBid, data.bestAsk, sparkLine, sparks);


    name.textContent = data.name;
    name.setAttribute('class', 'currency-name');
    currentBestBid.textContent = data.bestBid.toFixed(8);
    currentBestAsk.textContent = data.bestAsk.toFixed(8);
    lastChangeBid.textContent = data.lastChangeBid.toFixed(8);
    lastChangeBid.setAttribute('class', 'sorted-column');
    lastChangeAsk.textContent = data.lastChangeAsk.toFixed(8);
    sparkLine.setAttribute('class', 'sparkline');
    sparkLine.appendChild(sparks);
    createRow(row, name, currentBestBid, currentBestAsk, lastChangeBid, lastChangeAsk, sparkLine);
    sortTable();
}

function updateTableRow(data, updateIndex) {
    const rows = document.getElementById(tableName).rows;
    let rowIndex = 0;
    for (let r = 1, n = rows.length; r < n; r++) {
        if (rows[r].cells[0].innerText == data.name.toUpperCase()) {
            rowIndex = r;
            break;
        }
    }
    currencyData[updateIndex] = data;
    let cells = document.getElementById(tableName).rows[rowIndex].cells;
    cells[1].innerText = data.bestBid.toFixed(8);
    cells[2].innerText = data.bestAsk.toFixed(8);
    cells[3].innerText = data.lastChangeBid.toFixed(8);
    cells[4].innerText = data.lastChangeAsk.toFixed(8);
    let sparkLine = cells[5];
    const sparks = createElement('span');
    renderSparkline(data.bestBid, data.bestAsk, sparkLine, sparks);
    sortTable();
}

function sortTable() {
    let table, rows, switching, i, x, y, shouldSwitch;
    table = document.getElementById(tableName);
    switching = true;
    while (switching) {
        switching = false;
        rows = table.rows;
        for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName('TD')[3];
            y = rows[i + 1].getElementsByTagName('TD')[3];
            if (x.innerText > y.innerText) {
                shouldSwitch = true;
                break;
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }
}

function createElement(type) {
    return document.createElement(type);
};

function createRow(row, ...columns) {
    columns.forEach(element => {
        row.appendChild(element);
    });
}

function renderSparkline(bestBid, bestAsk, sparkLine, sparks) {
    let midPrice = (bestBid + bestAsk) / 2;
    sparkLineArray.push(midPrice);
    if (sparkLineArray.length > 10) {
        sparkLineArray.shift();
    }
    if (!sparkLine) {
        sparkLine = new Sparkline(sparks)
    }
    sparkLine = new Sparkline(sparkLine);
    sparkLine.draw(sparkLineArray);
}
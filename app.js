var API_KEY = "4NWUHVNMHWONROUK";

var myChart = null;

var stockPrices = [];
var spPrices    = [];
var stockDates  = [];

function loadChart() {

  var ticker = document.getElementById("stockInput").value.toUpperCase();
  document.getElementById("status").innerText = "Loading stock data...";

  var url = "https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=" + ticker + "&apikey=" + API_KEY;

  fetch(url)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      saveStockData(data);
      document.getElementById("status").innerText = "Stock loaded. Loading S&P 500... (wait 15 seconds)";
      setTimeout(loadSP500, 100);
    });
}

// -------------------------------------------------------
// STEP 2: Save the stock prices from the API response
// -------------------------------------------------------
function saveStockData(data) {

  var series  = data["Monthly Adjusted Time Series"];
  var allDates = Object.keys(series).sort();

  // Only keep the last 10 years
  stockPrices = [];
  stockDates  = [];

  for (var i = 0; i < allDates.length; i++) {
    var date = allDates[i];
    var year = parseInt(date.substring(0, 4));

    if (year >= 2015) {
      stockDates.push(date);
      stockPrices.push(parseFloat(series[date]["5. adjusted close"]));
    }
  }
}


function loadSP500() {

  var url = "https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=SPY&apikey=" + API_KEY;

  fetch(url)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      saveSPData(data);
      drawChart();
    });
}

function saveSPData(data) {

  var series = data["Monthly Adjusted Time Series"];

  spPrices = [];

  for (var i = 0; i < stockDates.length; i++) {
    var date = stockDates[i];
    if (series[date]) {
      spPrices.push(parseFloat(series[date]["5. adjusted close"]));
    } else {
      spPrices.push(null);
    }
  }
}

function drawChart() {

  // Normalize: divide every price by the first price, multiply by 100
  var stockNorm = [];
  var spNorm    = [];

  for (var i = 0; i < stockPrices.length; i++) {
    stockNorm.push((stockPrices[i] / stockPrices[0]) * 100);
  }

  for (var i = 0; i < spPrices.length; i++) {
    if (spPrices[i]) {
      spNorm.push((spPrices[i] / spPrices[0]) * 100);
    } else {
      spNorm.push(null);
    }
  }

  
  var latest = stockPrices[stockPrices.length - 1].toFixed(2);
  document.getElementById("status").innerText = "Latest Price: $" + latest;

  if (myChart) {
    myChart.destroy();
  }


  var ctx = document.getElementById("myChart").getContext("2d");

  myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: stockDates,
      datasets: [
        {
          label: document.getElementById("stockInput").value.toUpperCase(),
          data: stockNorm,
          borderColor: "red",
          borderWidth: 2,
          pointRadius: 0,
          fill: false
        },
        {
          label: "S&P 500",
          data: spNorm,
          borderColor: "blue",
          borderWidth: 2,
          pointRadius: 0,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" }
      },
      scales: {
        y: {
          title: { display: true, text: "Growth (Start = 100)" }
        }
      }
    }
  });
}

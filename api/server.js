const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

function convertToTradingViewData(data) {
  return {
      t: data.map(item => new Date(`${item.day}T00:00:00Z`).getTime() / 1000),
      c: data.map(item => item.max_amount_eur !== null ? parseFloat(item.max_amount_eur) : null),
      o: data.map(item => item.max_amount_eur !== null ? parseFloat(item.max_amount_eur) : null),
      h: data.map(item => item.max_amount_eur !== null ? parseFloat(item.max_amount_eur) : null),
      l: data.map(item => item.max_amount_eur !== null ? parseFloat(item.max_amount_eur) : null),
      v: data.map(() => 0),  // Placeholder for volume
      s: "ok"
  };
}

function fillMissingDates(rawData, fromTimestamp, toTimestamp) {
  let currentTimestamp = fromTimestamp;
  const dayInSeconds = 86400;
  const filledData = [];

  while (currentTimestamp <= toTimestamp) {
      const currentDate = new Date(currentTimestamp * 1000).toISOString().slice(0, 10);
      const existingItem = rawData.find(item => item.day === currentDate);

      if (existingItem) {
          filledData.push(existingItem);
      } else {
          filledData.push({
              day: currentDate,
              max_amount_eur: null,
              max_amount_usd: null
          });
      }

      currentTimestamp += dayInSeconds;
  }

  return filledData;
}

// Endpoint pour les données de configuration
app.get('/config', (req, res) => {
  res.json({
    supports_search: true,
    supports_group_request: false,
    supports_marks: false,
    supports_timescale_marks: false,
    supports_time: false,
    exchanges: [
      { value: "", name: "All Exchanges", desc: "" },
      { value: "NasdaqNM", name: "NasdaqNM", desc: "NasdaqNM" },
      { value: "NYSE", name: "NYSE", desc: "NYSE" },
      { value: "NCM", name: "NCM", desc: "NCM" },
      { value: "NGM", name: "NGM", desc: "NGM" }
    ],
    symbols_types: [
      { name: "All types", value: "" },
      { name: "Stock", value: "stock" },
      { name: "Index", value: "index" }
    ],
    supported_resolutions: ["1", "5", "15", "30", "60", "D", "W", "M"]
  });
});

// Endpoint pour les informations sur les symboles
app.get('/symbol_info', (req, res) => {
  const { symbol } = req.query;

  if (symbol === "AAPL") {
    res.json({
      symbol: "AAPL",
      name: "Apple Inc.",
      exchange: "NASDAQ",
      type: "stock",
      timezone: "America/New_York",
      session: "0930-1630", // Assurez-vous que ceci correspond bien aux jours inclus dans vos données
      listed_exchange: "NASDAQ",
      has_intraday: true,
      has_no_volume: false,
      minmov: 1,
      pricescale: 100,
      supported_resolutions: ["1D", "1W", "1M"]
    });
  } else {
    res.status(404).json({ s: "error", errmsg: "Symbol not supported" });
  }
});

// Nouveau endpoint pour les symboles (GET /symbols)
app.get('/symbols', (req, res) => {
  const symbol = req.query.symbol;

  if (symbol === "AAPL") {
    res.json({
      symbol: "AAPL",
      name: "Apple Inc.",
      exchange: "NASDAQ",
      type: "stock",
      session: "0930-1630",
      timezone: "America/New_York",
      ticker: "AAPL",
      minmov: 1,
      pricescale: 100,
      has_intraday: true,
      supported_resolutions: ["1", "5", "15", "30", "60", "D", "W", "M"]
    });
  } else {
    res.status(404).json({ s: "error", errmsg: "Symbol not found" });
  }
});

// Endpoint pour l'heure actuelle du serveur
app.get('/time', (req, res) => {
  res.send((Math.floor(Date.now() / 1000)).toString());
});

// Endpoint pour les données de prix historiques
// app.get('/history', (req, res) => {
//   const { symbol, from, to, resolution } = req.query;

//   console.log(`Received parameters: from=${from}, to=${to}, symbol=${symbol}, resolution=${resolution}`);

//   if (symbol !== "AAPL") {
//     return res.status(400).json({ s: "error", errmsg: "Symbol not supported" });
//   }

//   const fromTimestamp = parseInt(from, 10);
//   const toTimestamp = parseInt(to, 10);

//   const rawData = [
//     {
//         "day": "2024-08-20",
//         "max_amount_eur": "1904.14",
//         "max_amount_usd": "2107.79",
//     },
//     {
//         "day": "2024-08-21",
//         "max_amount_eur": "1912.44",
//         "max_amount_usd": "2132.03",
//     },
//     {
//         "day": "2024-08-22",
//         "max_amount_eur": "1908.56",
//         "max_amount_usd": "2123.86",
//     },
//     {
//         "day": "2024-08-24",
//         "max_amount_eur": "1992.39",
//         "max_amount_usd": "2229.88",
//     },
//     {
//         "day": "2024-08-25",
//         "max_amount_eur": "1983.67",
//         "max_amount_usd": "2222.89",
//     },
//     {
//         "day": "2024-08-26",
//         "max_amount_eur": "1992.43",
//         "max_amount_usd": "2231.30",
//     },
//     {
//         "day": "2024-08-27",
//         "max_amount_eur": "1961.05",
//         "max_amount_usd": "2186.27",
//     }
//   ];

//   const filledData = fillMissingDates(rawData, fromTimestamp, toTimestamp);

//   const filteredData = filledData.filter(item => {
//     const itemTimestamp = new Date(`${item.day}T00:00:00Z`).getTime() / 1000;
//     // console.log(`Checking item: day=${item.day}, timestamp=${itemTimestamp}`);
//     return itemTimestamp >= fromTimestamp && itemTimestamp <= toTimestamp;
//   });

//   if (filteredData.length === 0) {
//     console.log('No data found for the given period.');
//     return res.json({ s: "no_data" });
//   }

//   const tradingViewData = convertToTradingViewData(filteredData);

//   res.json(tradingViewData);
// });

app.get('/history', (req, res) => {
  const { symbol, from, to, resolution } = req.query;

  console.log(`Received parameters: from=${from}, to=${to}, symbol=${symbol}, resolution=${resolution}`);

  if (symbol !== "AAPL") {
      return res.status(400).json({ s: "error", errmsg: "Symbol not supported" });
  }

  const rawData = [
      {
          "day": "2024-08-20",
          "max_amount_eur": "1904.14",
          "max_amount_usd": "2107.79",
      },
      {
          "day": "2024-08-21",
          "max_amount_eur": "1912.44",
          "max_amount_usd": "2132.03",
      },
      {
          "day": "2024-08-22",
          "max_amount_eur": "1908.56",
          "max_amount_usd": "2123.86",
      },
      {
          "day": "2024-08-24",
          "max_amount_eur": "1992.39",
          "max_amount_usd": "2229.88",
      },
      {
          "day": "2024-08-25",
          "max_amount_eur": "1983.67",
          "max_amount_usd": "2222.89",
      },
      {
          "day": "2024-08-26",
          "max_amount_eur": "1992.43",
          "max_amount_usd": "2231.30",
      },
      {
          "day": "2024-08-27",
          "max_amount_eur": "1961.05",
          "max_amount_usd": "2186.27",
      }
  ];

// Vérifier si les dates du 24 et 25 août 2024 sont correctement générées
rawData.forEach(item => {
  const timestamp = new Date(`${item.day}T00:00:00Z`).getTime() / 1000;
  console.log(`Date: ${item.day}, Timestamp: ${timestamp}`);
});

  // Filtrage des données en fonction de l'intervalle de temps demandé
  const filteredData = rawData.filter(item => {
      const itemTimestamp = new Date(`${item.day}T00:00:00Z`).getTime() / 1000;
      return itemTimestamp >= from && itemTimestamp <= to;
  });

  // Si aucune donnée ne correspond à la période demandée, renvoyer "no_data"
  if (filteredData.length === 0) {
      return res.json({ s: "no_data" });
  }

  // Conversion des données en format TradingView
  const tradingViewData = convertToTradingViewData(filteredData);

  // Envoi des données à TradingView
  res.json(tradingViewData);
});


app.listen(3007, () => {
  console.log('Server is running on port 3007');
});
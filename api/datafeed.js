import React, { useEffect, useRef } from 'react';
import './index.css';
import { widget } from '../../charting_library';

// Création d'un Datafeed personnalisé
class CustomDatafeed {
  onReady(callback) {
    setTimeout(() => callback({
      supports_search: false,
      supports_group_request: false,
      supports_marks: false,
      supports_timescale_marks: false,
      supports_time: true,
    }), 0);
  }

  resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {
    setTimeout(() => {
      onSymbolResolvedCallback({
        name: symbolName,
        ticker: symbolName,
        description: "Custom Data",
        type: "stock",
        session: "24x7",
        timezone: "Etc/UTC",
        pricescale: 100,
        minmov: 1,
        supported_resolutions: ['1', '5', '15', '30', '60', 'D', 'W', 'M'],
        has_intraday: true,
        has_seconds: false,
        has_no_volume: true,
        volume_precision: 2,
      });
    }, 0);
  }

  getBars(symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback) {
    fetch('http://localhost:3007/prices') // Utilise votre API pour récupérer les données
      .then(response => response.json())
      .then(data => {
        if (data.length) {
          onHistoryCallback(data, { noData: false });
        } else {
          onHistoryCallback([], { noData: true });
        }
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        onErrorCallback(err);
      });
  }

  subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) {
    // Implémenter si vous avez besoin de données en temps réel
  }

  unsubscribeBars(subscriberUID) {
    // Implémenter si vous avez besoin de données en temps réel
  }
}

export const TVChartContainer = () => {
  const chartContainerRef = useRef();

  useEffect(() => {
    const widgetOptions = {
      symbol: 'CUSTOM_DATA',  // Nom de votre série de données
      datafeed: new CustomDatafeed(), // Utilisation du Datafeed personnalisé
      interval: 'D',  // Intervalle de temps par défaut
      container: chartContainerRef.current,
      library_path: '/charting_library/',
      locale: 'en',
      theme: 'Dark',
      overrides: {
        "paneProperties.backgroundGradientStartColor": "#020024",
        "paneProperties.backgroundGradientEndColor": "#4f485e",
        "volumePaneSize": "small",
      },
      disabled_features: [
        'header_widget', 
        'symbol_search_hot_key',  
        'display_market_status',  
        'header_resolutions',  
        'header_interval_dialog_button',  
        'header_settings',  
        'header_fullscreen_button',  
        'header_compare',  
        'header_undo_redo',  
        'header_screenshot',  
        'header_chart_type',  
        'control_bar',  
        'left_toolbar',  
        'timeframes_toolbar',  
        'legend_context_menu',  
        'volume_force_overlay',
      ],
      enabled_features: [],
      charts_storage_url: 'https://saveload.tradingview.com',
      charts_storage_api_version: '1.1',
      client_id: 'tradingview.com',
      user_id: 'public_user_id',
      fullscreen: false,
      autosize: true,
      studies_overrides: {
        "volume.volume

import React, { useEffect, useRef } from 'react';
import './index.css';
import { widget } from '../../charting_library';

export const TVChartContainer = () => {
    const chartContainerRef = useRef();


    useEffect(() => {
        const widgetOptions = {
            symbol: 'AAPL',
            datafeed: new window.Datafeeds.UDFCompatibleDatafeed('http://localhost:3007'),
            interval: 'D',
            container: chartContainerRef.current,
            library_path: '/charting_library/',
            locale: 'en',
            theme: 'Dark',
            overrides: {
                "paneProperties.backgroundGradientStartColor": "#020024",
                "paneProperties.backgroundGradientEndColor": "#4f485e",
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
            fullscreen: true,
            autosize: true,
            studies_overrides: {
                "volume.volume.color.0": "rgba(0,0,0,0)",
                "volume.volume.color.1": "rgba(0,0,0,0)",
            },
        };

        const tvWidget = new widget(widgetOptions);      

        tvWidget.onChartReady(() => {
            // Changer le type de graphique à une ligne
            tvWidget.chart().setChartType(3); // 3 est l'ID pour un graphique en ligne

            // Supprimer la série de volume du graphique si elle est visible
            const allStudies = tvWidget.chart().getAllStudies();
            allStudies.forEach((study) => {
                if (study.name === 'Volume') {
                    tvWidget.chart().removeEntity(study.id);
                }
            });
        });
        
        return () => {
            tvWidget.remove();  // Nettoyer le widget à la suppression du composant
        };
    }, []);

    return (
        <div
            ref={chartContainerRef}
            className={'TVChartContainer'}
        />
    );
};
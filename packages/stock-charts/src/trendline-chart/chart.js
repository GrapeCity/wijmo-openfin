import React from 'react';
import * as wjChart from "@grapecity/wijmo.react.chart";
import * as wjChartAnalysis from "@grapecity/wijmo.react.chart.analytics";
import { ChannelName, ChannelTopics, Portfolio } from 'stock-core';
import './chart.css';

const fin = window.fin;

class Chart extends React.Component {
  _portfolio;
  _channelPromise;

  /**
   * Indicates that disconnection occured and currently connection is in progress.
   * It is used to avoid multiple connections in such cases.
   */
  _reconnecting = false;

  constructor(props) {
    super(props);

    this.state = {
      current: null      
    };

    // create portfolio
    this._portfolio = new Portfolio({
      storageKey: this.props.storageKey,
      mapToChartData: this._mapToChartData
    });

    this.props.onPeriodChange(this._portfolio.chartPeriod);
    this.props.onColorChange(null);

    this._initChannel();
  }

  renderChartContent() {
    if (this.state.current) {
      return [
        <wjChart.FlexChartSeries
            key="series"
            itemsSource={this.state.current.chartData}
            name={this.state.current.symbol}
            style={{ stroke: this.state.current.color }}>
        </wjChart.FlexChartSeries>,
        <wjChartAnalysis.FlexChartTrendLine
            key="trendline"
            itemsSource={this.state.current.chartData}
            name="Linear Trendline"
            style={{ stroke: 'white' }}
            fitType="Linear">
        </wjChartAnalysis.FlexChartTrendLine>
      ];
    }
    return [];
  }

  render() {
    this._portfolio.chartPeriod = this.props.period;
    return (
      <wjChart.FlexChart binding="price" bindingX="date" chartType="Line">
        {this.renderChartContent()}
        <wjChart.FlexChartAxis wjProperty="axisY" format="n0" majorGrid={true} majorTickMarks={0}></wjChart.FlexChartAxis>
        <wjChart.FlexChartAxis wjProperty="axisX" format="MMM-yyyy" majorGrid={true} majorTickMarks={0}></wjChart.FlexChartAxis>
        <wjChart.FlexChartLegend position="None"></wjChart.FlexChartLegend>
      </wjChart.FlexChart>
    );
  }

  _initChannel() {    
    if (typeof fin === 'undefined') {
        console.warn('Channels cannot be initialized because "fin" is undefined.');
        return;
    }

    this._channelPromise = fin.InterApplicationBus.Channel.connect(ChannelName)
      .then(channel => this._handleConnect(channel));
  }

  _handleConnect(channel) {
    this._reconnecting = false;            
    console.log('Channels: connected');
    this._loadItems(channel);
    channel.register(ChannelTopics.CurrentChanged, symbol => this._currentChanged(symbol));
    channel.register(ChannelTopics.ItemAdded, item => this._itemAdded(item));
    channel.register(ChannelTopics.ItemRemoved, item => this._itemRemoved(item));
    channel.register(ChannelTopics.ItemChanged, item => { /* do nothing */ });
    channel.onDisconnection(channelInfo => this._handleDisconnect(channelInfo));
    return channel;
  }

  _handleDisconnect(channelInfo) {
    if (this._reconnecting) {
      return;
    }
    this._reconnecting = true;
    // handle the channel lifecycle here - we can connect again which will return a promise
    // that will resolve if/when the channel is re-created.
    console.log('Channels: disconnected');
    this._initChannel();
  }

  _mapToChartData(first, price) {
    return { 
      date: price.date,
      price: price.price
    };
  }

  _parsePrices(prices) {
    return prices.map(p => {
      return {
          date: new Date(p.date),
          price: p.close
      };
    });
  }

  _loadItems(channel) {
    channel.dispatch(ChannelTopics.LoadItems).then(response => {
      const current = response.current;
      const items = response.items;
      console.log('Channels: received response "loadItems". Items: ' + items.length);
      items.forEach(item => {
        let prices = this._parsePrices(item.prices);
        this._portfolio.addItem(item.symbol, item.chart, item.name, item.color, prices);
      });
      window.setTimeout(() => {
        this._currentChanged(current);
      });
    });

    console.log('Channels: sent message "loadItems"');
  }

  _itemAdded(item) {
    console.log('Channels: received message "itemAdded"');

    let prices = this._parsePrices(item.prices);
    this._portfolio.addItem(item.symbol, item.chart, item.name, item.color, prices);
  }

  _itemRemoved(item) {
    console.log('Channels: received message "itemRemoved"');

    this._portfolio.removeItem(item.symbol);
  }

  // update chart selection to match portfolio selection
  _currentChanged(symbol) {
    console.log('Channels: received message "currentChanged"');
    
    /* eslint-disable-next-line eqeqeq */
    const current = this._portfolio.view.items.find(pi => pi.symbol == symbol);

    this.props.onColorChange(current.color);
    this.setState({
      current
    });
  }
}

export default Chart;
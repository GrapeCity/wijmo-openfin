import React from 'react';
import * as wjChart from "@grapecity/wijmo.react.chart";
import * as wjChartAnalysis from "@grapecity/wijmo.react.chart.analytics";
import { Portfolio } from 'stock-core';
import { ChartController } from '../chartController';
import './chart.css';

class Chart extends React.Component {
  constructor(props) {
    super(props);

    this.chartRef = React.createRef();
    
    // create portfolio
    this.portfolio = new Portfolio({
      storageKey: this.props.storageKey,
      mapToChartData: this.mapToChartData
    });

    this.controller = new ChartController({
      chartRef: this.chartRef,
      portfolio: this.portfolio,
      parsePrices: this.parsePrices,
      handleCurrentChange: this.handleCurrentChange.bind(this)
    });

    this.state = {
      current: null
    };

    this.props.onInitialize(this.portfolio.chartPeriod, null);
  }

  renderChartContent() {
    if (this.state.current) {
      return [
        <wjChart.FlexChartSeries
            key="series"
            itemsSource={this.state.current.chartData}
            name={this.state.current.symbol}
            style={{ stroke: '#ff4700' }}
            altStyle={{ stroke: '#00ff75' }}>
        </wjChart.FlexChartSeries>,
        <wjChartAnalysis.FlexChartMovingAverage
            key="movingAverage"
            itemsSource={this.state.current.chartData}
            name="Moving Average"
            binding="close"
            style={{ stroke: 'white' }}
            period={6}
            type="Simple">
        </wjChartAnalysis.FlexChartMovingAverage>
      ];
    }
    return [];
  }

  render() {
    this.portfolio.chartPeriod = this.props.period;
    return (
      <div ref={this.chartRef} className="chart-container"
          onAnimationStart={this.controller.handleAnimationStart.bind(this.controller)}
          onAnimationEnd={this.controller.handleAnimationEnd.bind(this.controller)}>
        <wjChart.FlexChart chartType="HighLowOpenClose" binding="high,low,open,close" bindingX="date">
          {this.renderChartContent()}
          <wjChart.FlexChartAxis wjProperty="axisY" format="n0" majorGrid={true} majorTickMarks={0}></wjChart.FlexChartAxis>
          <wjChart.FlexChartAxis wjProperty="axisX" format="MMM-yyyy" majorGrid={true} majorTickMarks={0}></wjChart.FlexChartAxis>
          <wjChart.FlexChartLegend position="None"></wjChart.FlexChartLegend>
        </wjChart.FlexChart>
      </div>
    );
  }

  mapToChartData(first, price) {
    return {
      date: price.date,
      high: price.high,
      low: price.low,
      open: price.open,
      close: price.close
    };
  }

  parsePrices(prices) {
    return prices.map(p => {
      return {
          date: new Date(p.date),
          high: p.high,
          low: p.low,
          open: p.open,
          close: p.close
      };
    });
  }

  handleCurrentChange(current) {
    this.setState({
      current
    });
    this.props.onColorChange(current ? current.color : null);
  }
}

export default Chart;
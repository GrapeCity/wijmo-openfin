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
    this.portfolio.chartPeriod = this.props.period;
    return (  
      <div ref={this.chartRef} className="chart-container"
          onAnimationStart={this.controller.handleAnimationStart.bind(this.controller)}
          onAnimationEnd={this.controller.handleAnimationEnd.bind(this.controller)}>
        <wjChart.FlexChart chartType="Line" binding="price" bindingX="date">
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
      price: price.price
    };
  }

  parsePrices(prices) {
    return prices.map(p => {
      return {
          date: new Date(p.date),
          price: p.close
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
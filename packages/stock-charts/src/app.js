import React from 'react';
import { ChartPeriod } from 'stock-core';
import Config from './config';
import AppContext from './appContext';
import HlocChart from './hloc-chart/chart';
import TrendlineChart from './trendline-chart/chart';
import './app.css';
import financeLogo from './assets/finance.png';
import reactLogo from './assets/react.svg';

const fin = window.fin;

class App extends React.Component {
  constructor(props) {
    super(props);

    const context = new AppContext();
    context.chartName.then(chartName => {
      document.title = this.getTitle(chartName) + ' ' + Config.VERSION;
      this.setState({
        chartName: chartName,
        title: document.title
      });
    });

    
    this.state = {
      chartPeriod: ChartPeriod.m12,
      chartColor: null
    };
  }

  getTitle(chartName) {
    switch (chartName) {
      case 'hloc':
        return 'Stock HLOC';
      
      case 'trendline':
        return 'Stock Trendline';

      default:
        return document.title;
    }
  }

  renderChartButtons() {
    return Object.keys(ChartPeriod).map(key => {
      const chartPeriod = ChartPeriod[key];
      return (
        <button key={key} 
                type="button" 
                className={"btn btn-default " + (this.isActiveChartPeriod(chartPeriod) ? 'active' : '')}
                onClick={() => this.changeChartPeriod(chartPeriod)}>
          {key}
        </button>
      );
    });
  }

  renderWindowButtons() {
    return (
      <div className="window-buttons">
          <button type="button" className="close" onClick={() => this.closeApp()}>&times;</button>
      </div>
    );
  }

  renderChart() {
    switch(this.state.chartName) {
      case 'hloc':
        return <HlocChart period={this.state.chartPeriod} 
                          onPeriodChange={(p) => this.changeChartPeriod(p)}
                          onColorChange={(c) => this.changeChartColor(c)}
                          storageKey={Config.HLOC_STGKEY} />;

      case 'trendline':
        return <TrendlineChart period={this.state.chartPeriod} 
                          onPeriodChange={(p) => this.changeChartPeriod(p)}
                          onColorChange={(c) => this.changeChartColor(c)}
                          storageKey={Config.TRENDLINE_STGKEY} />;

      default:
        return null;          
    }
  }

  render() {
    const chartColor = this.state.chartColor
    const headerStyle = {
      boxShadow: chartColor ? '0px 0px 20px ' + chartColor : 'none'
    };
    return (
      <div className="panel panel-default">
        <div className="panel-heading" style={headerStyle}>
          <div className="align-center">
            <img className="h-16" src={financeLogo} alt="app logo" />&nbsp;&nbsp;{this.state.title}
          </div>
          <div className="align-center">
            <samp>- built on <img className="h-16" src={reactLogo} alt="react logo" /> React -</samp>
          </div>
          <div className="align-center">
            <div className="btn-group btn-group-xs">
              {this.renderChartButtons()}
            </div>
            <div className="window-buttons">
              {this.renderWindowButtons()}
            </div>
          </div>
        </div>
        
        <div className="panel-body">
          {this.renderChart()}
        </div>
      </div>
    );
  }

  isActiveChartPeriod(value) {
    return this.state.chartPeriod === value;
  }

  changeChartPeriod(value) {
    this.setState({
      chartPeriod: value
    });
  }

  changeChartColor(value) {
    this.setState({
      chartColor: value
    });
  }

  closeApp() {
    fin.Application.getCurrent()
      .then(app => app.getWindow())
      .then(win => win.close(false));
  }
}

export default App;

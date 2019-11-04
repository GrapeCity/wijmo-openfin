const fin = window.fin;

class AppContext {
    _initializePromise;
    _args;
    _chartName;

    get chartName() {
        return this._initializePromise
            .then(() => this._chartName);
    }

    constructor() {
        this._initializePromise = this._initialize();
    }

    _initialize() {
        return this._getInfo()
            .then(info => {
                console.log('Application info:', info); 
                this._chartName = this._getChartNameFromAppInfo(info);
                return fin.System.getCommandLineArguments();
            })
            .then(args => { 
                console.log('Command line arguments:', args); 
                this._args = args;
                if (this._chartName) {
                    return;
                }
                this._chartName = this._getChartNameFromArgs(args);
            })
            .catch(err => console.error(err));
    }

    async _getInfo() {
        const app = await fin.Application.getCurrent();
        return await app.getInfo();
    }

    _getChartNameFromAppInfo(info) {
        return info.initialOptions.wjStockPortfolioAppId;
    }

    _getChartNameFromArgs(args) {
        if (args.indexOf('--wj-stockportfolio-chart-hloc') !== -1) {
            return 'hloc';
        }

        if (args.indexOf('--wj-stockportfolio-chart-trendline') !== -1) {
            return 'trendline';
        }

        return 'hloc';
    }
}

export default AppContext;
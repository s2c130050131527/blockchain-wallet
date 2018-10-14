import TrendsController from './trends.controller';

class TrendsRouter {
  constructor(router,passport) {
    this.router = router;
    this.trendsController = new TrendsController();
    this.register();
    console.log('routing of trends done');
  }

  register() {
    this.router.get(
      '/tables/overview',
      this.getOverViewData.bind(this),
      this.trendsController.getOverViewTableData
    )
    this.router.get(
      '/graphs/history',
      this.getHistoricData.bind(this),
      this.trendsController.getHistoricData
    )
  }

  getOverViewData(req, res, next){
    next();
  }

  getHistoricData(req, res, next){
    next();
  }
}

export default TrendsRouter;

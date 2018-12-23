import TrendsService from './trends.service';
import TrendsUtils from '../../utils/TrendsUtils';

class TrendsController {
  async getOverViewTableData(req, res) {
    try {
      let reqQuery = req.query || {};
      let filters = {
        "fromList": reqQuery.fromList || TrendsUtils.coinsList().map(
          (item) => item.symbol),
        "toList": reqQuery.toList || TrendsUtils.currencyList().map(
          (item) => item.name),
      }
      const trendsData = await TrendsService.getMultipleCoinsBriefData(filters);
      let options = {
        "sortField": req.query.sortField || "USD.price",
        "sort": req.query.sort || "DESC"
      }
      let finalTrendsObj = await TrendsService.transformCoinsData(trendsData, options);
      res.status(200).send(finalTrendsObj);
    } catch (error) {
      res.status(400).send('Something Went Wrong');
      return;
    }
  }

  async getHistoricData(req, res) {
    try {
      let reqQuery = req.query || {};
      let filters = {
        "coin": reqQuery.coin || TrendsUtils.coinsList().map(
          (item) => item.symbol)[0],
        "toCurrency": reqQuery.toCurrency || TrendsUtils.currencyList().map(
          (item) => item.name)[0],
        "graphType": reqQuery.graphType || "day"
      }
      const trendsData = await TrendsService.getSingleCoinHistoricData(filters, {});
      let finalData = {};
      finalData.startTime = trendsData.TimeFrom;
      finalData.endTime = trendsData.TimeTo;
      finalData.data = trendsData.Data;
      res.status(200).send(finalData);
    } catch (error) {
      res.status(400).send('Something Went Wrong');
      return;
    }
  }
}

export default TrendsController;

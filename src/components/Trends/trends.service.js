import db from '../../database';
import request from "request-promise";
import TrendsUtils from '../../utils/TrendsUtils';
class TrendsService {
    'use strict'

    constructor() {
      this.trends = [];
    }

    async getMultipleCoinsBriefData(filters) {
      let fsyms = filters.fromList;
      let tsyms = filters.toList;
      var options = {
        method: 'GET',
        uri: `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${fsyms}&tsyms=${tsyms}`,
        json: true
      }
      const coinsData = await request(options);
      return coinsData;
    }

    async getSingleCoinHistoricData(filters) {
      let fsyms = filters.coin;
      let tsyms = filters.toCurrency;
      let date = new Date();
      let dataType, limit;
      if (filters.graphType === "hour") {
        dataType = "histominute";
        limit = date.getUTCMinutes();
      } else if (filters.graphType === "day") {
        dataType = "histohour";
        limit = date.getUTCHours();
      } else if (filters.graphType === "month") {
        dataType = "histoday";
        limit = date.getUTCDate();
      } else {
        dataType = "histoday";
        limit = 365;
      }
      var options = {
        method: 'GET',
        uri: `https://min-api.cryptocompare.com/data/${dataType}?fsym=${fsyms}&tsym=${tsyms}&limit=${limit}`,
        json: true
      }
      const coinsData = await request(options);
      return coinsData;
    }

    async transformCoinsData(coinsData, options) {
      let finalData = [];
      let fields = TrendsUtils.fieldsListOverview();
      let freeFields = TrendsUtils.freeFieldsList();
      let hrsFields = TrendsUtils.hrsFieldsList();
      let daysFields = TrendsUtils.daysFieldsList();
      let fieldsMapping = TrendsUtils.allFieldsMapping();
      for (let k in coinsData.RAW) {
        let data = {
          "coin": k
        };
        for (let p in coinsData.RAW[k]) {
          data[p] = {};
          for (let i = 0; i < freeFields.length; i++) {
            if (fields.indexOf(freeFields[i]) > -1
              && coinsData.RAW[k][p][freeFields[i]]) {
              data[p][fieldsMapping[freeFields[i]]] =
                coinsData.RAW[k][p][freeFields[i]];
            }
          }
          data[p]["last_24_hrs"] = {};
          for (let i = 0; i < hrsFields.length; i++) {
            if (fields.indexOf(hrsFields[i]) > -1
              && coinsData.RAW[k][p][hrsFields[i]]) {
               data[p]["last_24_hrs"][fieldsMapping[hrsFields[i]]] =
                coinsData.RAW[k][p][hrsFields[i]];
            }
          }
          data[p]["day"] = {};
          for (let i = 0; i < daysFields.length; i++) {
            if (fields.indexOf(daysFields[i]) > -1
              && coinsData.RAW[k][p][daysFields[i]]) {
               data[p]["day"][fieldsMapping[daysFields[i]]] =
                coinsData.RAW[k][p][daysFields[i]];
            }
          }
        }
        finalData.push(data);
      }
      finalData = finalData.sort((a,b) => {
        let aValue = TrendsUtils.getValue(a,options.sortField);
        let bValue = TrendsUtils.getValue(b,options.sortField);
        if (options.sort=="ASC") {
          return aValue-bValue;
        } else {
          return bValue-aValue;
        }
      })
      return {"data":finalData};
    }

    async transformHistoricData(historicData, options) {
      if (options.trimStart) {

      }
      let fields = TrendsUtils.fieldsListOverview();
      let freeFields = TrendsUtils.freeFieldsList();
      let hrsFields = TrendsUtils.hrsFieldsList();
      let daysFields = TrendsUtils.daysFieldsList();
      let fieldsMapping = TrendsUtils.allFieldsMapping();
      for (let k in coinsData.RAW) {
        let data = {
          "coin": k
        };
        for (let p in coinsData.RAW[k]) {
          data[p] = {};
          for (let i = 0; i < freeFields.length; i++) {
            if (fields.indexOf(freeFields[i]) > -1
              && coinsData.RAW[k][p][freeFields[i]]) {
              data[p][fieldsMapping[freeFields[i]]] =
                coinsData.RAW[k][p][freeFields[i]];
            }
          }
          data[p]["last_24_hrs"] = {};
          for (let i = 0; i < hrsFields.length; i++) {
            if (fields.indexOf(hrsFields[i]) > -1
              && coinsData.RAW[k][p][hrsFields[i]]) {
               data[p]["last_24_hrs"][fieldsMapping[hrsFields[i]]] =
                coinsData.RAW[k][p][hrsFields[i]];
            }
          }
          data[p]["day"] = {};
          for (let i = 0; i < daysFields.length; i++) {
            if (fields.indexOf(daysFields[i]) > -1
              && coinsData.RAW[k][p][daysFields[i]]) {
               data[p]["day"][fieldsMapping[daysFields[i]]] =
                coinsData.RAW[k][p][daysFields[i]];
            }
          }
        }
        finalData.push(data);
      }
      finalData = finalData.sort((a,b) => {
        let aValue = TrendsUtils.getValue(a,options.sortField);
        let bValue = TrendsUtils.getValue(b,options.sortField);
        if (options.sort=="ASC") {
          return aValue-bValue;
        } else {
          return bValue-aValue;
        }
      })
      return {"data":finalData};
    }
}

export default new TrendsService();

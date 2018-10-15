class TrendsUtils{

    coinsList(){
        return [
            {
                name:'Bitcoin Test',
                symbol:'BTC'
            },
            {
                name:'Litecoin Test',
                symbol:'LTC'
            }
        ]
    }
    currencyList(){
        return [
            {
                name:'USD',
                symbol:'$'
            },
            {
                name:'EUR',
                symbol:'€'
            }
        ]
    }

    allFieldsList(){
        return [
          "PRICE", "LASTVOLUME", "LASTVOLUMETO", "VOLUMEDAY","VOLUMEDAYTO",
          "VOLUME24HOUR","VOLUME24HOURTO","OPENDAY","HIGHDAY", "LOWDAY",
          "OPEN24HOUR", "HIGH24HOUR", "LOW24HOUR", "CHANGE24HOUR",
          "CHANGEPCT24HOUR", "CHANGEDAY", "CHANGEPCTDAY", "SUPPLY", "MKTCAP",
          "TOTALVOLUME24H", "TOTALVOLUME24HTO"
        ]
    }

    freeFieldsList(){
        return [
          "PRICE", "SUPPLY", "MKTCAP"
        ]
    }

    hrsFieldsList(){
        return [
          "VOLUME24HOURTO", "OPEN24HOUR", "HIGH24HOUR", "LOW24HOUR",
          "CHANGE24HOUR", "CHANGEPCT24HOUR"
        ]
    }

    daysFieldsList(){
        return [
          "VOLUMEDAYTO", "OPENDAY", "HIGHDAY", "LOWDAY", "CHANGEDAY",
          "CHANGEPCTDAY"
        ]
    }

    allFieldsMapping(){
        return {
          "PRICE":"price",
          "LASTVOLUMETO":"last_vol",
          "VOLUMEDAY": "volume",
          "VOLUMEDAYTO":"volume",
          "VOLUME24HOUR": "volume",
          "VOLUME24HOURTO": "volume",
          "OPENDAY": "open",
          "HIGHDAY": "high",
          "LOWDAY":"low",
          "OPEN24HOUR":"open",
          "HIGH24HOUR":"high",
          "LOW24HOUR":"low",
          "CHANGE24HOUR":"change",
          "CHANGEPCT24HOUR":"change_percent",
          "CHANGEDAY":"change",
          "CHANGEPCTDAY":"change_percent",
          "SUPPLY":"supply",
          "MKTCAP":"market_cap",
          "TOTALVOLUME24H":"total_vol",
          "TOTALVOLUME24HTO": "total_vol"
        }
    }

    fieldsListOverview(){
        return [
          "PRICE", "VOLUMEDAYTO","VOLUME24HOURTO","OPENDAY","HIGHDAY", "LOWDAY",
          "OPEN24HOUR", "HIGH24HOUR", "LOW24HOUR", "CHANGE24HOUR",
          "CHANGEPCT24HOUR", "CHANGEDAY", "CHANGEPCTDAY", "MKTCAP"
        ]
    }

    getValue(obj, field) {
      let fieldList = field.split(".")
      let value = obj[fieldList[0]];
      for (let k = 1; k < fieldList.length; k++) {
        value = value[fieldList[k]];
      }
      return value;
    }
}

export default new TrendsUtils();

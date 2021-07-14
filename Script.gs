const sss = SpreadsheetApp.getActiveSpreadsheet()
const main= sss.getSheetByName('Current Transactions')
const history = sss.getSheetByName("History")
const apiKey = sss.getSheetByName("Welcome").getRange("D3").getValue()
const stockNames=["Torn & Shanghai Banking", "Torn City Investments", "Syscore MFG", "Legal Authorities Group", "Insured On Us", "Grain", "Torn City Health Service", "Yazoo", "The Torn City Times", "Crude & Co", "Messaging Inc.", "TC Music Industries", "TC Media Productions", "I Industries Ltd.", "Feathery Hotels Group", "Symbiotic Ltd.", "Lucky Shots Casino", "Performance Ribaldry", "Eaglewood Mercenary", "Torn City Motors", "Empty Lunchbox Traders", "Home Retail Group", "Tell Group Plc.","", "West Side University", "International School TC", "Big Al's Gun Shop", "Evil Ducks Candy Corp", "Mc Smoogle Corp", "Wind Lines Travel", "Torn City Clothing"]

function onOpen() { 
  var ui = SpreadsheetApp.getUi();
  
  ui.createMenu("Set Up")
    .addItem("setup","setup")
    .addToUi();
}
function setup(){
  ScriptApp.newTrigger('getStocks')
      .timeBased()
      .everyMinutes(1)
      .create();
}
function getStocks() {
if(apiKey!=""){
Utilities.sleep(30000)
  var ids=[]
  var call = JSON.parse(UrlFetchApp.fetch("https://api.torn.com/user/?selections=stocks&key="+apiKey).getContentText())
  var data = call.stocks
  var callStocks =JSON.parse(UrlFetchApp.fetch("https://api.torn.com/torn/?selections=stocks&key="+apiKey).getContentText())
  var stocksData = callStocks.stocks
  Logger.log(data)
  Object.keys(data).forEach(sID=>{
  var name = stockNames[Number(sID)-1]
  //Logger.log(sID)
 // Logger.log(name)
  var dataT = data[sID].transactions
  Object.keys(dataT).forEach(tranID=>{
  var finder = main.getRange("B:B").createTextFinder(tranID).findNext()
  //Update transactions and check for new additions
  if(finder == null){
  Logger.log("New addition: "+tranID)
  var time_bought = dataT[tranID].time_bought
  var buyPrice = dataT[tranID].bought_price
  var shares = dataT[tranID].shares
  var time = Utilities.formatDate(new Date(time_bought*1000),"GMT","HH:mm:ss - dd/MM/YY")
  main.getRange(main.getLastRow()+1,1,1,6).setValues([[sID,tranID,name,time,buyPrice,shares]])
  //main.getRange(main.getLastRow(),11).setValue(time_bought)
  }
  else{
  //Logger.log(tranID+"Already in sheet")
  }
  ids.push(Number(tranID))
  })
  })
  Logger.log("ids "+ids)
  //Check each transaction is still active if not gets the row to then send to history and delete
  var oldTrans = []
  var linesToDel=[]
  for(i=3;i<=main.getLastRow()+3;i++){
  var tID = main.getRange(i,2).getValue()
  Logger.log("tid "+tID+" row "+i)
  //Logger.log(tID)
  if(ids.indexOf(tID)<0){
  var line = main.getRange(i,2,1,9).getValues()
  Logger.log(line[0])
  var now = Utilities.formatDate(new Date,"GMT","HH:mm:ss - dd/MM/YY")
  history.getRange(history.getLastRow()+1,2,1,line[0].length).setValues(line)
  if(line[0][0]!=""){
  history.getRange(history.getLastRow(),12).setValue(now)
  }
 // var d = new Date
 // var endTs = d.getTime()
 // var startTs = main.getRange(i,11).getValue()
  //var tDif = (endTs/1000)-startTs
 // Logger.log(endTs+"/1000"+startTs+"="+tDif)
  //history.getRange(history.getLastRow(),13).setValue(Utilities.formatDate(new Date(endTs-(startTs*1000)),"GMT","HH:mm:ss - dd/MM/YY"))
  //main.deleteRow(i)
  //history.getRange(history.getLastRow(),13).setValue(tDif)
  linesToDel.push(i)
  }
  }
  Logger.log(linesToDel)
  for(a in linesToDel){
  Logger.log("a:"+a)
  main.deleteRow(linesToDel[a]-a)
  }
  //updates the profit ie pulls most recent price per stock and prints to sheet
  for(x=3;x<=main.getLastRow();x++){
  var stockID = main.getRange(x,1).getValue()
  var price = stocksData[stockID].current_price
  main.getRange(x,7).setValue(price)
  var bP = main.getRange(x,5).getValue()
  var dif= ((Number(price)-Number(bP))/Number(bP))
  main.getRange(x,8).setValue(dif)
  var q = main.getRange(x,6).getValue()
  main.getRange(x,9).setValue(Math.round((Number(price)*Number(q))-(Number(bP)*Number(q))))
  main.getRange(x,10).setValue(Math.round(price*q*0.001))
  }
}
}

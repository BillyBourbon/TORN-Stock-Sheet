const sss = SpreadsheetApp.getActiveSpreadsheet()
const main= sss.getSheetByName('Current Transactions')
const history = sss.getSheetByName("History")

function onOpen() { 
  var ui = SpreadsheetApp.getUi();
  
  ui.createMenu("Set Up")
    .addItem("setup","setup")
    .addToUi();
}
function setup(){
  ScriptApp.newTrigger('run')
      .timeBased()
      .everyMinutes(1)
      .create();
}
function run(){
  var key = sss.getSheetByName("Welcome").getRange("D3").getValue()
  var stock_names= get_stock_names(key)
  var transaction_ids = get_transactions(key,stock_names)
  }
function log_transaction(output){
  main.getRange(main.getLastRow()+1,1,1,output.length).setValues([output])
  
  
  
  }
function get_transactions(key,stock_names){
  var call = JSON.parse(UrlFetchApp.fetch("https://api.torn.com/user/?selections=stocks&key="+key).getContentText())
  var data = call.stocks
  var transaction_ids=[]
  Logger.log(data)
  Object.keys(data).forEach(stock_id=>{
                            var name = stock_names[stock_id-1]
                            var transactions = data[stock_id]["transactions"]
                            Object.keys(transactions).forEach(transaction_id=>{
                                                              transaction_ids.push(transaction_id)
                                                              var tran = data[stock_id]["transactions"][transaction_id]
                                                              var time_bought = tran["time_bought"]
                                                              var buy_price = tran["bought_price"]
                                                              var shares = tran["shares"]
                                                              time_bought = Utilities.formatDate(new Date(time_bought*1000),"GMT","dd/MM/YY - HH:mm")
                                                              var output=[stock_id,transaction_id,name,time_bought,buy_price,Number(shares)]
                                                              log_transactions(output)
                                                              Logger.log(output)
                                                              })
                                       })

                                       
  return(transaction_ids)                                     
  }
function get_stock_names(key){
  var call = JSON.parse(UrlFetchApp.fetch("https://api.torn.com/torn/?selections=stocks&key="+key).getContentText())
  var data = call.stocks
  var stock_names = []
  Object.keys(data).forEach(i=>{
                            var name = data[i]["name"]
                            stock_names.push(name)
  })
  return(stock_names)
  }

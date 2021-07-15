// Gets the spreadsheet and the relative sheets 
const sss = SpreadsheetApp.getActiveSpreadsheet();
const main= sss.getSheetByName('Current Transactions');
const history = sss.getSheetByName("History");
// Adds a custom menu to the sheet to allow a setup function to be ran
function onOpen() { 
  var ui = SpreadsheetApp.getUi();
  ui.createMenu("Set Up")
    .addItem("setup","setup")
    .addToUi();
}
// Sets up the triggers to run minutely
function setup(){
  ScriptApp.newTrigger('run')
      .timeBased()
      .everyMinutes(1)
      .create();
}
// Runs all the functions in order. The Main Function
function run(){
  var key = sss.getSheetByName("Welcome").getRange("D3").getValue();
  var x= get_stock_names(key);
  var stock_names=x[0];
  var prices = x[1];
  var transaction_ids = get_transactions(key,stock_names,prices);
  update_prices(prices);
  check_transactions(transaction_ids);
  }
//Updates Stock Prices
function update_prices(prices){
  var sheet_length = main.getLastRow();
  for(i=3;i<=sheet_length;i++){
    var stock_id = main.getRange(i,1).getValue();
    var price = prices[stock_id-1];
    main.getRange(i,7).setValue(price);
    }
  }
//Checks the transactions are still active if not moves them to history
function check_transactions(transaction_ids){
  var logged_trans = main.getRange(3,2,main.getLastRow()-2).getValues();
  Object.keys(logged_trans).forEach(i=>{
                       var id = logged_trans[i];
                       id=id.toString();
                       if(transaction_ids.indexOf(id)<0){
                         var row = main.getRange("B3:B").createTextFinder(Number(id)).findNext();
                         if(row!==null){
                           row = Number(i)+3;
                           move_row(row);
                           }
                         }
  })
  }
// Moves the old transaction row to History
function move_row(row){
  main.getRange(row,2,1,main.getLastColumn()-2).moveTo(history.getRange(history.getLastRow()+1,2));
  main.deleteRow(row);
  }
// Logs the transactions to the Main Sheet
function log_transaction(output){
  var tran_id= output[1];
  var finder= main.getRange("B:B").createTextFinder(tran_id).findNext();
  if(finder==null){
    main.getRange(main.getLastRow()+1,1,1,output.length).setValues([output]);
    }
  }
// Gets all active stock transactions
function get_transactions(key,stock_names,prices){
  var call = JSON.parse(UrlFetchApp.fetch("https://api.torn.com/user/?selections=stocks&key="+key).getContentText());
  var data = call.stocks;
  var transaction_ids=[];
  Object.keys(data).forEach(stock_id=>{
                            var name = stock_names[stock_id-1];
                            var price = prices[stock_id-1];
                            var transactions = data[stock_id]["transactions"];
                            Object.keys(transactions).forEach(transaction_id=>{
                                                              transaction_ids.push(transaction_id);
                                                              var tran = data[stock_id]["transactions"][transaction_id];
                                                              var time_bought = tran["time_bought"];
                                                              var buy_price = tran["bought_price"];
                                                              var shares = tran["shares"];
                                                              time_bought = Utilities.formatDate(new Date(time_bought*1000),"GMT","dd/MM/YY - HH:mm");
                                                              var output=[stock_id,transaction_id,name,time_bought,buy_price,Number(shares),price];
                                                              log_transaction(output);
                                                              })
                                       })

                                       
  return(transaction_ids);                                   
  }
// Gets all stock names and prices
function get_stock_names(key){
  var call = JSON.parse(UrlFetchApp.fetch("https://api.torn.com/torn/?selections=stocks&key="+key).getContentText());
  var data = call.stocks;
  var stock_names = [];
  var prices= [];
  Object.keys(data).forEach(i=>{
                            var name = data[i]["name"];
                            var price = data[i]["current_price"];
                            prices.push(price);
                            stock_names.push(name);
  })
  return([stock_names,prices]);
  }

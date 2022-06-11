process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
var graviex = require("./graviex.js");





// Market Making Bot using the graviex API


// Settings
	var seconds = 30; // How often would you like to check the order book
graviex.accessKey = ""; // API Key
graviex.secretKey = ""; // API Secret
setInterval(function() {
	console.log("_________________MARKET MAKING__________________");
	var theMarket = "dogebtc"; // Market to place orders on
	var increase = 0.000000001; // The amount to increase and decrease orders on both sides
	var maxSpread = 0.000000002; // The maximum spread allowed before placing new orders
	var volume = 100; // The volume of which you would like to set orders at





	// CLOSE ALL ORDERS 
	// Uncomment the below 6 lines if you wish to close all orders before checking and placing more.
//	graviex.clearAllOrders(function(res){
//		if(!res.error){
//			console.log("Removing old orders...");
//			res.forEach(function(order){
//				console.log(order.id + "|" + order.state + "|" + order.side);
//			});



			graviex.orderBook(theMarket, function(res){
				if(!res.error){
					var selling = parseFloat(res.asks[0].price);
					var buying = parseFloat(res.bids[0].price);
					console.log("[Market Making]");
					console.log("Selling At: " + selling.toFixed(9));
					console.log("Buying At: " + buying.toFixed(9));
					var spread = ((selling - increase) - (buying + increase)).toFixed(9);
					console.log("Spread: " + spread);
					if(spread < maxSpread){
						console.log("Spread within boundary...");
						return;
					}
					//
					//check if those orders our ours,
					var oursSell = false;
					var oursBuy = false;
					graviex.orders(theMarket, function(res){
						if(!res.error){
							//if not ours open orders + 1 and -1 each side of the market to try win spread
							//console.log(res);
							res.forEach(function(order){
								console.log(order.price);
								if(order.price == selling){
									oursSell = true; // Set this to false if you want to ladder the orders
								}
								if(order.price == buying){
									oursBuy = true;  // Set this to false if you want to ladder the orders
								}
							});

							var buyPrice = (buying + increase).toFixed(9);
							var sellPrice = (selling - increase).toFixed(9);

							if(!oursBuy || !oursSell){
								console.log("Spread larger than required, making tighter orders...");
								//buy
								console.log("Buy Price: " + buyPrice);
								console.log("Sell Price: " + sellPrice);

								graviex.createOrder(theMarket, "buy", volume, buyPrice, function(res){
									if(!res.error){
								//sell
								graviex.createOrder(theMarket, "sell", volume, sellPrice, function(res2){
									if(!res.error){
										console.log(res.id + "|" + res.state + "|" + res.side);
										console.log(res2.id + "|" + res2.state + "|" + res2.side);
									}else{
										console.log(res)
												}
											});
									}else{
										console.log(res)
									}
								});
							}else{
								console.log("Orders live are ours...");
							}

						}else{
							console.log(res)
						}
					});

				}else{
					console.log(res)
				}
			});

//		}else{
//			console.log(res)
//		}
//	});

}, seconds * 1000); // 60 * 1000 milsec

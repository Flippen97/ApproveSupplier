/****************************************************/
// Filename: Detail.Controller.js
// Created: Jerushan Benjamin
// Change history:
// 18.4.2018 
/****************************************************/
sap.ui.define([
	"zapp/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"zapp/model/formatter",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/Input",
	"sap/m/MessageToast",
	"sap/m/TextArea"
], function(BaseController, JSONModel, formatter, Dialog, Button, Label, Input, MessageToast, TextArea) {
	"use strict";

	var detailControl;
	return BaseController.extend("zapp.controller.Detail", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		onInit: function() {
			detailControl = this;
		
			 var that = this;

			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
		//	onchange

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
		
      
		},

	   onNavBack: function(oEvent) {
	   //	this.getRouter().show("master");
	   	 	this.getRouter().getTargets().display("master");
	   },
	   
	   _checkCBOX: function(oEvent) {
			var Model = this.getView().getModel("detailModel").getData();
			var oTable = this.byId("table");
			
			//oTable.removeSelections();
			oTable.clearSelection();
			var oRows = oTable.getRows();
		//	var a = [];
		if(Model.Zrolename == "AC")
		{
			for(var i= 0; i< oRows.length;i++)
			{
				    var oId = oRows[i].getDomRefs().rowSelector.id;
					var orId = oRows[i].getDomRefs().rowScrollPart.id;
					var orIdF = oRows[i].getDomRefs().rowFixedPart.id;
					//var oraId = oTable.getDomRefs();
					orId = "#"+ orId;
					oId = "#"+ oId ;
					orIdF = "#"+ orIdF;
				 //var oStatus = oRows[i].getAggregation("cells")[6].getProperty("text");
				 var oEditA = Model.Header_Item_nav.results[i].EditAllowed;
				 if(oEditA == "N")
				 {
				 	$("#__component0---detail--table-selall").remove();
				 	$(oId).css("pointer-events","none");
				 	$(oId).css("background-color","#c6d8ec");
				 	$(orId).css("pointer-events","none");
				 	$(orId).css("background-color","#c6d8ec");
				 	$(orIdF).css("pointer-events","none");
				 	$(orIdF).css("background-color","#c6d8ec");
				 //	oRows[i].getAggregation("cells")[3].setProperty("enabled",false);
				 }else
				 {
				  $(oId).click();
				 //	a.push(i);
				 }
				// oTable.set
				
			}}else if(Model.Zrolename == "AM")
			{
				oTable.selectAll();
			}
			
		
		},
		
		
		/////
	
		_onObjectMatched: function(oEvent) {
		
			var detPage = this.byId("page");
			var lPanel = this.byId("idpanel");
			var oRole ;
			detPage.setBusy(true);
			//lPanel.setProperty("expanded",false);
	lPanel.setExpanded(false);
			var sObjectId = oEvent.getParameter("arguments").objectId;
			var editBool;

			var oView = this.getView();
		
			this.byId("costId").setEnabled(false);
			var that = this;
			

			var sServiceUrl = "/sap/opu/odata/sap/ZMM_APRROVE_SUPPLIER_INVOICE_SRV";
			var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl);
			var jsonModel = new sap.ui.model.json.JSONModel();
			var feedModel = new sap.ui.model.json.JSONModel();
			var attachModel = new sap.ui.model.json.JSONModel();
			var HistoryModel = new sap.ui.model.json.JSONModel();
			var count;
			

			var oHead = this.byId("objectHeader");
			var iDetail = this.byId("SimpleFormDisplay354");
			var oTable = this.byId("table");
			var aList = this.byId("AttachmentList");
			var oFeed = this.byId("notesFeed");
			var oHistory = this.byId("idHistoryTable");
			

			//Model for notes
			oModel.read("/AttachmentsSet?$filter= belnr eq '" + sObjectId + "'", {
				success: function(data) {
					feedModel.setData(data);
					oFeed.setModel(feedModel, "feedModel");
				}
			}, {
				fail: function(err) {}
			});
			//Model for History tab
			oModel.read("/Workflow_logSet?$filter= Belnr eq '" + sObjectId + "'", {
				success: function(data) {
					HistoryModel.setData(data);
					oHistory.setModel(HistoryModel, "HistoryModel");
				}
			}, {
				fail: function(err) {}
			});

			//Model for Header and line items
			oModel.read("/WorkInboxSet('" + sObjectId + "')?$expand=WorkInbox_Header_nav/Header_Item_nav", {
				success: function(data) {
					jsonModel.setData(data.WorkInbox_Header_nav);
					count = data.WorkInbox_Header_nav.Header_Item_nav.results.length;
					if (count == 0){
						count = 1;
					}
					//table rows are dynamically changed using this
					oTable.setProperty('visibleRowCount', count);
					oRole = data.WorkInbox_Header_nav.Zrolename;
					if (data.WorkInbox_Header_nav.Zrolename == "AC") {
						editBool = true;
					} else {
						editBool = false;
					}
					//Control properties can be changed dynamically using this model
					that.getView().setModel(new sap.ui.model.json.JSONModel({
						tableInput: editBool
					}), 'controlModel');
					detPage.setBusy(false);

 
				}
			}, {
				fail: function(err) {detPage.setBusy(false);}
			});
			// Model for attachments
			oModel.read("ImageSet('" + sObjectId + "')", {
				success: function(data) {
					var a = [];
					a.push(data);
					var body = {};
					body.branch = a;
					if(data.Url ==="No Url")
					{
						body.branch[0].Belnr = "No Attachments";
						body.branch[0].Url = "";
						
					}
					attachModel.setData(body);
					aList.setModel(attachModel, "attachModel");
					setTimeout(function() {
						oView.setBusy(false);
						
						//oTable.selectAll();''
						if(oRole == "AC")
						{
						that._checkCBOX();          
						}
						else if(oRole == "AM")
						{
							oTable.selectAll();
						}
					//	 lPanel.setProperty("expanded",true);
								lPanel.setExpanded(true);
					}, 1500);

				}
			}, {
				fail: function(err) {}
			});

			oView.setModel(jsonModel, "detailModel");
			oTable.bindRows("detailModel>/Header_Item_nav/results");
			//oTable.getBinding("rows").attachChange(this._onInitialUpdateFinished);
				
			
	//	jsonModel.attachRequestCompleted(this.onInitialUpdateFinished);
//	this.getView().getModel("detailModel").attachUpdateFinished( this._onInitialUpdateFinished, this);
			
		

           
		},
		/* =========================================================== */
		// Function to add notes from the notes section and to refresh the 
		// model to retrive the posted data
		/* =========================================================== */
		

		handleAddNote: function(evt) {
			var text = evt.getParameters().value;
			var title = this.byId("noteTitle").getValue();
			var that = this;
			var Model = this.getView().getModel("detailModel").getData();
			var oBelnr = Model.Belnr;
			var sServiceUrl = "/sap/opu/odata/sap/ZMM_APRROVE_SUPPLIER_INVOICE_SRV";
			var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl);

			var requestBody = {};
			requestBody.belnr = oBelnr;
			requestBody.title = title;
			requestBody.content = text;
                         if(text == "" || title =="")
                         {
                         		var dialogoWarn = new Dialog({
					title: 'Warning',
					state: 'Warning',
					type: 'Message',
					content: [new Label({
						text: 'Please add your comments'
					})],
					beginButton: new Button({
						text: 'OK',
						press: function() {
							dialogoWarn.close();
						}
					}),
					afterClose: function() {
						dialogoWarn.destroy();
					}
				});

				dialogoWarn.open();
                         	//console.log("sdf");
                         }else
                         {
			//	MessageToast.show('Note is: ' + sText);
			oModel.create('/AttachmentsSet', requestBody, null, function() {
				//	alert("sent");
				that._onUpdateNotes();
				 
				var msg = 'Note successfully added';
				MessageToast.show(msg);
			}, function(evt) {
				var dialog = new Dialog({
					title: 'Error',
					state: 'Error',
					type: 'Message',
					content: [new Label({
						text: 'Request Failed !'
					})],
					beginButton: new Button({
						text: 'OK',
						press: function() {
							dialog.close();
						}
					}),
					afterClose: function() {
						dialog.destroy();
					}
				});

				dialog.open();
			});
                         }
		},

		stopBusy: function() {
			this.getView().setBusy(false);
		},
		/* =========================================================== */
		//Function to update the notes Section.
		/* =========================================================== */

		_onUpdateNotes: function() {
			this.byId("noteTitle").setValue("");
			var sServiceUrl = "/sap/opu/odata/sap/ZMM_APRROVE_SUPPLIER_INVOICE_SRV";
			var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl);
			var Model = this.getView().getModel("detailModel").getData();
			var feedModel = new sap.ui.model.json.JSONModel();
			var oFeed = this.byId("notesFeed");

			var sObjectId = Model.Belnr;
			oModel.read("/AttachmentsSet?$filter= belnr eq '" + sObjectId + "'", {
				success: function(data) {
					feedModel.setData(data);
					oFeed.setModel(feedModel, "feedModel");
				}
			}, {
				fail: function(err) {}
			});

		},
		updateDetail: function(sObject)
		{
				var detPage = this.byId("page");
	detPage.setBusy(true);
var editBool;

	var oView = this.getView();
var that = this;
	var sServiceUrl = "/sap/opu/odata/sap/ZMM_APRROVE_SUPPLIER_INVOICE_SRV";
			var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl);
			var jsonModel = new sap.ui.model.json.JSONModel();
	var count;
//	var oHead = this.byId("objectHeader");
		//	var iDetail = this.byId("SimpleFormDisplay354");
			var oTable = this.byId("table");
			oModel.read("/WorkInboxSet('" + sObject + "')?$expand=WorkInbox_Header_nav/Header_Item_nav", {
				success: function(data) {
					jsonModel.setData(data.WorkInbox_Header_nav);
					count = data.WorkInbox_Header_nav.Header_Item_nav.results.length;
					if (count == 0) {
						count = 1;
					}
					//table rows are dynamically changed using this
					oTable.setProperty('visibleRowCount', count);
					if (data.WorkInbox_Header_nav.Zrolename == "AC") {
						editBool = true;
					} else if(data.WorkInbox_Header_nav.Zrolename == "AM") {
						editBool = false;
					}
					//Control properties can be changed dynamically using this model
					that.getView().setModel(new sap.ui.model.json.JSONModel({
						tableInput: editBool
					}), 'controlModel');
					detPage.setBusy(false);
                    that.giveitamin(that);

				}
			}, {
				fail: function(err) {detPage.setBusy(false);}
			});
				oView.setModel(jsonModel, "detailModel");
			oTable.bindRows("detailModel>/Header_Item_nav/results");
		//	oTable.selectAll();
			//that._checkCBOX();
			that.giveitamin(that);
		},

		/* =========================================================== */
		// trigerred on decision action , figures the action and 
		// and calls a function to update the data in the backend
		/* =========================================================== */
		onSplit: function(evt) {
				var oTable = this.byId("table");
					var Model = this.getView().getModel("detailModel").getData();
					var oRole = Model.Zrolename;
					//busying
					//oTable.setBusy(true);
					if(oRole != "AM")
					{
			var oSelected = this.byId("table").getSelectedIndices();
			var oRows = this.byId("table").getRows();
			var that = this;
			if(oSelected.length == 1){
					for (var i = 0; i < oRows.length; i++) {
	//	var flag = 0 ;
		for(var j = 0 ; j < oSelected.length; j++)
		{
		if(i == oSelected[j])
		{
			var amtWRbtr = oRows[oSelected[j]].getAggregation("cells")[1].getProperty("value");
			// amtWRbtr = amtWRbtr.replace(/./g, "");
			// amtWRbtr = amtWRbtr.replace(/,/g, ".");
			amtWRbtr = amtWRbtr.replace(/[.]/g, "");
			amtWRbtr = amtWRbtr.replace(/,/g, ".");
			var d = {
					Belnr: Model.Header_Item_nav.results[i].Belnr,
					
					EditAllowed: Model.Header_Item_nav.results[i].EditAllowed,

					Buzei: oRows[oSelected[j]].getAggregation("cells")[0].getProperty("text"),
					
					Txt50: Model.Header_Item_nav.results[i].Txt50,

					ACResult: '',
					
					Wrbtr: amtWRbtr,
					
					Saknr: oRows[oSelected[j]].getAggregation("cells")[2].getProperty("value"),
					
					Kostl: oRows[oSelected[j]].getAggregation("cells")[3].getProperty("value"),
					
					Change:'I',
					
					Aufnr:  oRows[oSelected[j]].getAggregation("cells")[4].getProperty("value"),
					
					Kokrs:  oRows[oSelected[j]].getAggregation("cells")[10].getProperty("text"),
					
					Prctr:  oRows[oSelected[j]].getAggregation("cells")[11].getProperty("text"),
					
					
				
					Zrolename: Model.Zrolename

				};
			//	flag = 1;
					Model.Header_Item_nav.results.push(d);
					// var count = 	oTable.setProperty('visibleRowCount') + 1;
					// oTable.setProperty('visibleRowCount', count);
						that.getView().getModel("detailModel").setData(Model);
						
						//Busying
							//	oTable.setBusy(false);
		}
			
		}
		// if(flag != 1)
		// {
		// 		var d = {
		// 				Belnr: Model.Header_Item_nav.results[i].Belnr,

		// 			Buzei: oRows[i].getAggregation("cells")[0].getProperty("text"),

		// 			ACResult: '',
					
		// 			Wrbtr: oRows[i].getAggregation("cells")[1].getProperty("value"),
					
		// 			Saknr: oRows[i].getAggregation("cells")[2].getProperty("value"),
					
		// 			Kostl: oRows[i].getAggregation("cells")[4].getProperty("value"),
					
		// 			Change:'U',
					
		// 			Aufnr:  oRows[i].getAggregation("cells")[5].getProperty("value"),
				
		// 			Zrolename: Model.Zrolename

		// 		};
		// 			Model.Header_Item_nav.results.push(d);
		// 			// 	var count = 	oTable.setProperty('visibleRowCount') + 1;
		// 			// oTable.setProperty('visibleRowCount', count);
		// 			that.getView().getModel("detailModel").setData(Model);
		// }
			}
				
			}
			else if(oSelected.length == 0)
			{
					var adialog = new Dialog({
					title: 'Warning',
					state: 'Warning',
					type: 'Message',
					content: [new Label({
						text: 'Kindly select a line item to split'
					})],
					beginButton: new Button({
						text: 'OK',
						press: function() {
							adialog.close();
						}
					}),
					afterClose: function() {
						adialog.destroy();
					}
				});

				adialog.open();
				
			}
			else
			{
					var odialog = new Dialog({
					title: 'Warning',
					state: 'Warning',
					type: 'Message',
					content: [new Label({
						text: 'Only one line item can be split at a time '
					})],
					beginButton: new Button({
						text: 'OK',
						press: function() {
							odialog.close();
						}
					}),
					afterClose: function() {
						odialog.destroy();
					//	oTable.selectAll();
				//	that._checkCBOX();
					}
				});

				odialog.open();
			}
			
			that._updateVisibleRows();
					}
					else
					{
					
					}
		},
			onUndo: function(){
			var sServiceUrl = "/sap/opu/odata/sap/ZMM_APRROVE_SUPPLIER_INVOICE_SRV";
			var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl);
			var detailMod = this.getView().getModel("detailModel");
			var detailData = detailMod.getData();
			var objID = detailData.Belnr;
			var count;
			var that =this;
			var oTable = this.byId("table");
			
					oModel.read("/WorkInboxSet('" + objID + "')?$expand=WorkInbox_Header_nav/Header_Item_nav", {
				success: function(data) {
					detailMod.setData(data.WorkInbox_Header_nav);
						count = data.WorkInbox_Header_nav.Header_Item_nav.results.length;
					if (count == 0) {
						count = 1;
					}
					//table rows are dynamically changed using this
					oTable.setProperty('visibleRowCount', count);
				//	oTable.selectAll();
					that.giveitamin(that);
				}
					
			}, {
				fail: function(err) {}
			});
			
		},
		// onSave: function(){
		// },
		_updateVisibleRows: function(evt) {
				var oRows = this.getView().getModel("detailModel").getData().Header_Item_nav.results.length;
				this.byId("table").setProperty('visibleRowCount', oRows);
		//	this._checkCBOX();
		this.giveitamin(this);
				
		},
		giveitamin: function(ext)
		{
			// var oTable = this.byId("table");
			//  oTable.setBusy(true);
			
			setTimeout(function(){ ext._checkCBOX(); }, 500);
			
		},
		onSelection: function(evt)
		{
				var oTable = this.byId("table");
				var selected = oTable.getSelectedIndices().length;
				var index= oTable.getSelectedIndices();
				var Model = this.getView().getModel("detailModel").getData();
	            var oRole  = Model.Zrolename;
				var cButton = this.byId("CancelButton");
				var oRows = oTable.getRows();
				var oStat;
				if(oRole == "AM")
				{
					this.byId("oSplit").setEnabled(false);
					this.byId("oUndo").setEnabled(false);
					this.byId("oSave").setEnabled(false);
					oTable.selectAll();
					oStat = Model.WiStat;
					cButton.setEnabled(true);
						if(oStat == "New")
					{
						cButton.setText("Assign To Me");
					}
					else if(oStat == "In Process")
					{
						cButton.setText("Cancel Assignment");
					}
					else if(oStat == "")
					{
						cButton.setEnabled(false);
					}
				}
				else if(oRole == "AC")
				{
					this.byId("oSplit").setEnabled(true);
					this.byId("oUndo").setEnabled(true);
					this.byId("oSave").setEnabled(true);
				
				if(selected == 1)
				{
					oStat = oRows[index[0]].getAggregation("cells")[6].getProperty("text");
					cButton.setEnabled(true);
					if(oStat == "New")
					{
						cButton.setText("Assign To Me");
					}
					else if(oStat == "In Process")
					{
						cButton.setText("Cancel Assignment");
					}
					else if(oStat == "")
					{
						cButton.setEnabled(false);
					}
					
				}
				else
				{
						cButton.setEnabled(false);
					
				}
				}
				else
				{
					cButton.setEnabled(false);
				}
		},
		onAssignment: function(evt)
		{
				var detPage = this.byId("page");
			detPage.setBusy(true);
			var that = this;
			var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZMM_APRROVE_SUPPLIER_INVOICE_SRV");
			var Model = this.getView().getModel("detailModel").getData();
			var aBelnr = Model.Belnr;
			var oSelected = this.byId("table").getSelectedIndices();
			var dWord;
		//	var oRows = this.byId("table").getRows();
		
		var request = {};
		if(Model.Zrolename == "AC")
		{
		request.wi_id = Model.Header_Item_nav.results[oSelected[0]].wi_id;
		request.WiStat = Model.Header_Item_nav.results[oSelected[0]].WiStat;
		}
		else if(Model.Zrolename == "AM")
		{
		request.wi_id = Model.Wi_id;
		request.WiStat = Model.WiStat;
		}
		
		if(request.WiStat == "New")
		{
			dWord = "Assigned";
		}
		else if(request.WiStat == "In Process")
		{
			dWord = "Cancelled";
		}

		oModel.create('/SupplItemSet', request, null, function(header,response) {
				var dialog = new Dialog({
					title: 'Success',
					state: 'Success',
					type: 'Message',
					content: [new Label({
						text: dWord
					})],
					beginButton: new Button({
						text: 'OK',
						press: function() {
							dialog.close();
						}
					}),
					afterClose: function() {
						dialog.destroy();
					}
				});

				dialog.open();
					detPage.setBusy(false);
				that.updateDetail(aBelnr);
			
		}, function(evt) {
					

				var dialog = new Dialog({
					title: 'Error',
					state: 'Error',
					type: 'Message',
					content: [new Label({
						text: 'Request Failed !'
					})],
					beginButton: new Button({
						text: 'OK',
						press: function() {
							dialog.close();
						}
					}),
					afterClose: function() {
						dialog.destroy();
					}
				});

				dialog.open();
			detPage.setBusy(false);
				sap.ui.getCore().mastControl._oList.getBinding("items").refresh(true);
			});
			
			
		},
		onAction: function(evt) {
			var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZMM_APRROVE_SUPPLIER_INVOICE_SRV");
			var modelData = this.getView().getModel("detailModel").getData();
			var oTable = this.byId("table");
			var keyToDes;
			var selected;
			var exists;
			if(oTable.getSelectedIndices().length)
			{
			// var selected = oTable.getSelectedIndices().length;
			// var exists = oTable.getRows().length;
			/////to keep the condition
		
			if(modelData.Zrolename == "AC")
			{
				 selected = 1;
			 exists = 1;
			}else if(modelData.Zrolename == "AM")
			{
				 selected = oTable.getSelectedIndices().length;
			     exists = oTable.getRows().length;
			}
			///////////////////////////////////
			
			
			var that = this;
			if (selected == exists) {

				if (evt.getSource().getText() == "Approve") {
					keyToDes = "001";
					this._sendIT(keyToDes);
				} else if (evt.getSource().getText() == "Reject") {
					keyToDes = "002";
					var role = this.getView().getModel("detailModel").oData.Zrolename;

					if (role == "AC") {
						var dialog = new Dialog({
							title: 'Reject',
							type: 'Message',
							content: [
								new Label({
									text: 'Please, add your comment for rejection here',
									labelFor: 'rejectDialogTextarea'
								}),
								new Input('titleInput', {
									width: '100%',
									placeholder: 'Add title here'
								}),
								new TextArea('rejectDialogTextarea', {
									width: '100%',
									placeholder: 'Add note here'
								})
							],
							beginButton: new Button({
								text: 'Reject',
								press: function() {
									var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZMM_APRROVE_SUPPLIER_INVOICE_SRV");
									var oBelnr = that.getView().getModel("detailModel").oData.Belnr;
									var sText = sap.ui.getCore().byId('rejectDialogTextarea').getValue();
									var sTitle = sap.ui.getCore().byId('titleInput').getValue();
									var requestBody = {};
									requestBody.belnr = oBelnr;
									requestBody.title = sTitle;
									requestBody.content = sText;

									oModel.create('/AttachmentsSet', requestBody, null, function() {

										var msg = 'Note successfully added';
										MessageToast.show(msg);
										that._sendIT(keyToDes);
									}, function(evt) {
										var dialog = new Dialog({
											title: 'Error',
											state: 'Error',
											type: 'Message',
											content: [new Label({
												text: 'Request Failed !'
											})],
											beginButton: new Button({
												text: 'OK',
												press: function() {
													dialog.close();
												}
											}),
											afterClose: function() {
												dialog.destroy();
											}
										});

										dialog.open();
									});

									dialog.close();
								}
							}),
							endButton: new Button({
								text: 'Cancel',
								press: function() {
									dialog.close();
								}
							}),
							afterClose: function() {
								dialog.destroy();
							}
						});

						dialog.open();
					} else if (role == "AM") {
						this._sendIT(keyToDes);
					}
				}
				//
				else if(evt.getSource().getText() == "Save")
				{
					keyToDes = '';
					this._sendIT(keyToDes);
				}
				//
			} else if (selected != exists) {
				var dialog = new Dialog({
					title: 'Warning',
					state: 'Warning',
					type: 'Message',
					content: [new Label({
						text: 'Kindly Select all the line items'
					})],
					beginButton: new Button({
						text: 'OK',
						press: function() {
							dialog.close();
						}
					}),
					afterClose: function() {
						dialog.destroy();
					}
				});
				oTable.selectAll();
				dialog.open();
			}
}else
{
	var dialog1 = new Dialog({
					title: 'Warning',
					state: 'Warning',
					type: 'Message',
					content: [new Label({
						text: 'Kindly Select a line item'
					})],
					beginButton: new Button({
						text: 'OK',
						press: function() {
							dialog1.close();
						}
					}),
					afterClose: function() {
						dialog1.destroy();
					}
				});
				
				dialog1.open();
				this.giveitamin(this);
}
		},

		/* =========================================================== */
		// trigerred by  decision action event, figures the action and 
		// and  updates the data in the backend by passing the right data
		/* =========================================================== */

		_sendIT: function(desc) {
				var detPage = this.byId("page");
			detPage.setBusy(true);
			var that = this;
			var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZMM_APRROVE_SUPPLIER_INVOICE_SRV");
			var Model = this.getView().getModel("detailModel").getData();
			var aBelnr = Model.Belnr;
			var oSelected = this.byId("table").getSelectedIndices();
			var oRows = this.byId("table").getRows();
			var dWord = "";
			var requestChild = [];
			var oDesc = desc;

			if (oDesc == "001") {
				dWord = "Approved";
			} else if (oDesc == "002") {
				dWord = "Rejected";
			}
			else if(oDesc == '')
			{
				dWord = "Saved";
			}

			var requestBody = {};
			var sBldat = Model.Bldat;

			var lyear = sBldat.substring(0, 4);
			var lmonth = sBldat.substring(4, 6);
			var lday = sBldat.substring(6, 8);

			var dBldat = lyear + '-' + lmonth + '-' + lday;

			var sBudat = Model.Bldat;

			var uyear = sBudat.substring(0, 4);
			var umonth = sBudat.substring(4, 6);
			var uday = sBudat.substring(6, 8);

			var dBudat = uyear + '-' + umonth + '-' + uday;

			requestBody.Belnr = Model.Belnr;

			requestBody.Fdtag = '';

			requestBody.Zrolename = '';

			requestBody.Lifnr = '';

			requestBody.Name1 = '';

			requestBody.Zfbdt = '';

			requestBody.Wi_id = Model.Wi_id;

			requestBody.Bukrs = Model.Bukrs;

			requestBody.Blart = Model.Blart;

			requestBody.Xblnr = Model.Xblnr;

			requestBody.Bktxt = Model.Bktxt;

			requestBody.Bldat = dBldat;

			requestBody.Budat = dBudat;
			var a = Model.Wrbtr;

			a = a.replace(/,/g, "");
			requestBody.Wrbtr = a;

			requestBody.Waers = Model.Waers;
			var b = Model.Wmwst;

			b = b.replace(/,/g, "");
			requestBody.Wmwst = b;

			// for (var i = 0; i < oSelected.length; i++) {
			// 	var d = {
			// 		Belnr: Model.Header_Item_nav.results[i].Belnr,

			// 		Buzei: oRows[oSelected[i]].getAggregation("cells")[0].getProperty("text"),

			// 		DECISION: '',

			// 		PERS_COST: '',

			// 		AC_RESULT: oDesc,

			// 		AC_APPROVER: '',

			// 		AC_DATE: '',

			// 		Zrolename: Model.Zrolename,

			// 		UpdtFlag: ''

			// 	};
			// 	requestChild.push(d);
			// }

	for (var i = 0; i < oRows.length; i++) {
		var flag = 0;
		for(var j = 0 ; j < oSelected.length; j++)
		{
		if(i == oSelected[j])
		{
			
			var taxAmt = oRows[oSelected[j]].getAggregation("cells")[1].getProperty("value");
			var oChange ;
			if(Model.Header_Item_nav.results[i].Change == "I")
			{
				oChange = "I";
			}
			else{
				oChange = "U";
			}
			taxAmt = taxAmt.replace(/[.]/g, "");
			taxAmt = taxAmt.replace(/,/g, ".");
				var d = {
					Belnr: Model.Header_Item_nav.results[i].Belnr,

					Buzei: oRows[oSelected[j]].getAggregation("cells")[0].getProperty("text"),

					ACResult: oDesc,
					
					Wrbtr: taxAmt,
					
					EditAllowed: Model.Header_Item_nav.results[oSelected[j]].EditAllowed,
					
					Saknr: oRows[oSelected[j]].getAggregation("cells")[2].getProperty("value"),
					
					Kostl: oRows[oSelected[j]].getAggregation("cells")[3].getProperty("value"),
					
					Change: oChange,
					
					Aufnr:  oRows[oSelected[j]].getAggregation("cells")[4].getProperty("value"),
				
					Zrolename: Model.Zrolename

					

				};
				flag = 1;
					requestChild.push(d);
		}
			
		}
		if(flag != 1)
		{
				var oChangeI ;
			if(Model.Header_Item_nav.results[i].Change == "I")
			{
				oChangeI = "I";
			}
			else if(Model.Header_Item_nav.results[i].Change == "U"){
				oChangeI = "U";
			}
				else if(Model.Header_Item_nav.results[i].Change == ""){
				oChangeI = "";
			}
			var taxAmte = oRows[i].getAggregation("cells")[1].getProperty("value");
			taxAmte = taxAmte.replace(/[.]/g, "");
			taxAmte = taxAmte.replace(/,/g, ".");
				var d = {
					Belnr: Model.Header_Item_nav.results[i].Belnr,

					Buzei: oRows[i].getAggregation("cells")[0].getProperty("text"),

					ACResult: '',
					
					Wrbtr: taxAmte,
					
					EditAllowed: Model.Header_Item_nav.results[i].EditAllowed,
					
					Saknr: oRows[i].getAggregation("cells")[2].getProperty("value"),
					
					Kostl: oRows[i].getAggregation("cells")[3].getProperty("value"),
					
					Change: oChangeI,
					
					Aufnr:  oRows[i].getAggregation("cells")[4].getProperty("value"),
				
					Zrolename: Model.Zrolename

				};
					requestChild.push(d);
		}
			}
			requestBody.Header_Item_nav = requestChild;

			oModel.create('/SupplHeaderSet', requestBody, null, function(header,response) {
					detPage.setBusy(false);
                              if(  response.headers['sap-message'])
                              {
                            //   	var eMessage;
                            //   	var oReason = response.headers['sap-message'];
                            //   	oReason = $(oReason).find("message").text();
                            //   oReason = oReason.replace(/Document has not been saved/g, "");
                            //   if(oReason === that.getResourceBundle().getText("serv.GLerror"))
                            //   {
                            //   	eMessage = that.getResourceBundle().getText("fe.GLerror");
                            //   }
                            // else if(oReason === that.getResourceBundle().getText("serv.CCerror"))
                            //   {
                            //   	eMessage = that.getResourceBundle().getText("fe.CCerror");
                            //   }
                            //   else if(oReason === that.getResourceBundle().getText("serv.GLCCerror"))
                            //   {
                            //   	eMessage = that.getResourceBundle().getText("fe.GLCCerror");
                            //   }
                            //      else if(oReason === that.getResourceBundle().getText("serv.NvAMTerror"))
                            //   {
                            //   	eMessage = that.getResourceBundle().getText("fe.NvAMTerror");
                            //   }
                            //   else
                            //   {
                            //   	eMessage = oReason
                            //   }
                      
                              var oReason = response.headers['sap-message'];
                              //	var a =[];
                              	var c = "";
                              //	oReason = $(oReason).find("message").text();
                            //  oReason = oReason.replace(/Document has not been saved/g, "");
                              $(oReason).find('message').each(function(){
                              	var b =$(this).html();
 // a.push(b);
  if(c =="")
  {
  	c = b;
  }
  else{
 c = c + ". " + b ; 
  }

});
                              		var dialogSE = new Dialog({
					title: 'Error',
					state: 'Error',
					type: 'Message',
					content: [new Label({
						text: c
					})],
					beginButton: new Button({
						text: 'OK',
						press: function() {
							dialogSE.close();
						}
					}),
					afterClose: function() {
						dialogSE.destroy();
					}
				});

				dialogSE.open();
				 that.updateDetail(aBelnr);
                              }
                              else
                              {
				var dialog = new Dialog({
					title: 'Success',
					state: 'Success',
					type: 'Message',
					content: [new Label({
						text: "" + aBelnr + " Successfully " + dWord + ""
					})],
					beginButton: new Button({
						text: 'OK',
						press: function() {
							dialog.close();
						}
					}),
					afterClose: function() {
						dialog.destroy();
					}
				});

				dialog.open();
				if(oDesc == '')
				{
					
				 that.updateDetail(aBelnr);
					
				
				}
				else{
					sap.ui.getCore().mastControl._oList.getBinding("items").refresh(true);
				}
					
                              }
			
                              

			}, function(evt) {
					detPage.setBusy(false);

				var dialog = new Dialog({
					title: 'Error',
					state: 'Error',
					type: 'Message',
					content: [new Label({
						text: 'Request Failed !'
					})],
					beginButton: new Button({
						text: 'OK',
						press: function() {
							dialog.close();
						}
					}),
					afterClose: function() {
						dialog.destroy();
					}
				});

				dialog.open();
			
				sap.ui.getCore().mastControl._oList.getBinding("items").refresh(true);
			});

		}

	});

});
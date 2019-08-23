/****************************************************/
// Filename: Master.Controller.js
// Created: Jerushan Benjamin
// Change history:
// 18.4.2018 
/****************************************************/
sap.ui.define([
	"zapp/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/GroupHeaderListItem",
	"sap/ui/Device",
	"zapp/model/formatter",
	"zapp/model/grouper",
	"zapp/model/GroupSortState"
], function(BaseController, JSONModel, History, Filter, FilterOperator, GroupHeaderListItem, Device, formatter, grouper, GroupSortState) {
	"use strict";

	return BaseController.extend("zapp.controller.Master", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the master list controller is instantiated. It sets up the event handling for the master/detail communication and other lifecycle tasks.
		 * @public
		*/
		onInit: function() {

			var sServiceUrl = "/sap/opu/odata/sap/ZMM_APRROVE_SUPPLIER_INVOICE_SRV";
			var oMod = new sap.ui.model.odata.ODataModel(sServiceUrl);
			var oList = this.byId("list");
			this.setModel(oMod);

			this._oList = oList;
		
			sap.ui.getCore().mastControl = this;
			oList.getBinding("items").attachDataReceived(this.updated, this);

			this.getRouter().getRoute("master").attachPatternMatched(this._onMasterMatched, this);
			this.getRouter().attachBypassed(this.onBypassed, this);
		},

		/* =========================================================== */
		// Refreshes the data in the list when triggered 
		/* =========================================================== */
		handleRefresh: function() {
			this.getView().byId("list").getBinding("items").refresh(true);
			this._updateListItemCount();
			setTimeout(function() {
				this.getView().byId("pullToRefresh").hide();

			}.bind(this), 1000);

		},

		updated: function() {
			var oList = this._oList;

			var aItems = oList.getItems();

			if (aItems.length) {
				oList.setSelectedItem(aItems[0], true);
				this._updateListItemCount();
				this.getRouter().getTargets().display("object");
				this.getRouter().navTo("object", {
				objectId: aItems[0].getBindingContext().getProperty("Belnr")
				});
			} else {
				this._updateListItemCount();
				this.getRouter().getTargets().display("detailNoObjectsAvailable");
				//this.getRouter().navTo("detailNoObjectsAvailable");

			}
			//this.getView().setBusy(true);

		},

		onGoToDetail: function(evt) {
			var sKey = evt.getSource().getBindingContext().getProperty("Belnr");
			this.getRouter().navTo("object", {
				objectId: sKey
			});
		},
		/* =========================================================== */
		// Live search functionality 
		/* =========================================================== */
		onSearch: function(oEvent) {

			var aFilter = [];

			var sQuery = this.getView().byId("searchField").getValue();
			if (sQuery) {
				aFilter.push(new Filter("Belnr", "Contains", sQuery));
				// aFilter.push(new Filter("WiStat", "Contains", sQuery));
			}

			// filter binding
			var oList = this.getView().byId("list");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);

		},

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh: function() {
			this._oList.getBinding("items").refresh();

		},

		/**
		 * Event handler for the sorter selection.
		 * @param {sap.ui.base.Event} oEvent the select event
		 * @public
		 */
		onSort: function(oEvent) {
			var sKey = oEvent.getSource().getSelectedItem().getKey();
			//	aSorters = this._oGroupSortState.sort(sKey);
			var oSorter = new sap.ui.model.Sorter(sKey, true);

			var aSorters = [];

			aSorters.push(oSorter);
			this._oList.getBinding("items").sort(aSorters);

		},

		/**
		 * Event handler for the grouper selection.
		 * @param {sap.ui.base.Event} oEvent the search field event
		 * @public
		 */
		onGroup: function(oEvent) {
			var sKey = oEvent.getSource().getSelectedKey();
			var aSorters = [];
			if (sKey != "None") {
				var oSorter = new sap.ui.model.Sorter(sKey, true, true);
				aSorters.push(oSorter);
			} else {
				var oSorter = new sap.ui.model.Sorter("WiCd", true, false);
				aSorters.push(oSorter);
			}
			this._oList.getBinding("items").sort(aSorters);
			this._updateListItemCount();
		},

		/**
		 * Event handler for the filter button to open the ViewSettingsDialog.
		 * which is used to add or remove filters to the master list. This
		 * handler method is also called when the filter bar is pressed,
		 * which is added to the beginning of the master list when a filter is applied.
		 * @public
		 */
		onOpenViewSettings: function() {
			if (!this._oViewSettingsDialog) {
				this._oViewSettingsDialog = sap.ui.xmlfragment("zapp.view.ViewSettingsDialog", this);
				this.getView().addDependent(this._oViewSettingsDialog);

				this._oViewSettingsDialog.addStyleClass(this.getOwnerComponent().getContentDensityClass());
			}
			this._oViewSettingsDialog.open();

		},

		/**
		 * Event handler called when ViewSettingsDialog has been confirmed, i.e.
		 * has been closed with 'OK'. In the case, the currently chosen filters
		 * are applied to the master list, which can also mean that the currently
		 * applied filters are removed from the master list, in case the filter
		 * settings are removed in the ViewSettingsDialog.
		 * @param {sap.ui.base.Event} oEvent the confirm event
		 * @public
		 */
		onConfirmViewSettingsDialog: function(oEvent, filter) {
			var oList = this.getView().byId("list");
			var oBinding = oList.getBinding("items");
			var aFilter = [];
			if (this._oViewSettingsDialog.getSelectedFilterItems().length != 0) {
				for (var i = 0; i < this._oViewSettingsDialog.getSelectedFilterItems().length; i++) {
					var val = this._oViewSettingsDialog.getSelectedFilterItems()[i].getProperty("key");
					var key = this._oViewSettingsDialog.getSelectedFilterItems()[i].getParent().getProperty("key");

					if (key == "WiStat" || key == "WiPrio") {
						aFilter.push(new Filter(key, FilterOperator.EQ, val));
					}

				}

				if (this.date1 && this.date2) {
					aFilter.push(new sap.ui.model.Filter({

						path: "WiCd",

						operator: sap.ui.model.FilterOperator.BT,

						value1: this.date2,

						value2: this.date1
					}));

				}

				var oList = this.getView().byId("list");
				var oBinding = oList.getBinding("items");
				oBinding.filter(aFilter);
			} else {
				var aFilter = [];
				if (this.date1 && this.date2) {
					aFilter.push(new sap.ui.model.Filter({

						path: "WiCd",

						operator: sap.ui.model.FilterOperator.BT,

						value1: this.date2,

						value2: this.date1
					}));

					oBinding.filter(aFilter);
				} else {
					var aFilter = [];
					oBinding.filter(aFilter);
				}
			}

		},

		/**
		 * Event handler for the list selection event
		 * @param {sap.ui.base.Event} oEvent the list selectionChange event
		 * @public
		 */
		onSelectionChange: function(oEvent) {
			// get the list item, either from the listItem parameter or from the event's source itself (will depend on the device-dependent mode).
			this._showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
		},

		/**
		 * Used to create GroupHeaders with non-capitalized caption.
		 * These headers are inserted into the master list to
		 * group the master list's items.
		 * @param {Object} oGroup group whose text is to be displayed
		 * @public
		 * @returns {sap.m.GroupHeaderListItem} group header with non-capitalized caption.
		 */
		createGroupHeader: function(oGroup) {
			return new GroupHeaderListItem({
				title: oGroup.text,
				upperCase: false
			});
		},

		/**
		 * Event handler for navigating back.
		 * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
		 * If not, it will navigate to the shell home
		 * @public
		 */
		onNavBack: function() {
			var sPreviousHash = History.getInstance().getPreviousHash(),
				oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

			if (sPreviousHash !== undefined || !oCrossAppNavigator.isInitialNavigation()) {
				history.go(-1);
			} else {
				oCrossAppNavigator.toExternal({
					target: {
						shellHash: "#Shell-home"
					}
				});
			}
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * If the master route was hit (empty hash) we have to set
		 * the hash to to the first item in the list as soon as the
		 * listLoading is done and the first item in the list is known
		 * @private
		 */
		_onMasterMatched: function() {

		},

		/**
		 * Shows the selected item on the detail page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showDetail: function(oItem) {
			this.getRouter().navTo("object", {
				objectId: oItem.getBindingContext().getProperty("Belnr")
			});
		},

		/**
		 * Sets the item count on the master list header
		 * @param {integer} iTotalItems the total number of items in the list
		 * @private
		 */
		_updateListItemCount: function() {

			var count;
			var oRole;
			var oPage = this.byId("page");
			var model = this.byId("list").getModel();
		    var filter = this.byId("list").getBinding("items").aFilters;
			var oAc;
			var oAm;
		//	count = this.byId("list").getItems().length;
			model.read("/WorkInboxSet?$count",{
				filters:filter
			
			,
				success: function(data) {

					oRole = data.results[0].Zrolename;
					oAc =  data.results[0].ACcount;
					oAm =  data.results[0].AMcount;
					
				//	count = parseInt(oAc) + parseInt(oAm);
				count = data.results.length;
					if(parseInt(oAm) === 0)
					{
					oPage.setTitle("AC Pending Approvals (" + count + ")");
					}
					else
					{
					oPage.setTitle("AC & AM Pending Approvals (" + count + ")");
					}

				}
			, 
				fail: function(err) {
					console.log(err);
				}
			});

		},

		/**
		 * Internal helper method to apply both group and sort state together on the list binding
		 * @param {sap.ui.model.Sorter[]} aSorters an array of sorters
		 * @private
		 */
		_applyGroupSort: function(aSorters) {
			this._oList = this.byId("list");
			this._oList.getBinding("items").sort(aSorters);
		},

		/**
		 * Internal helper method that sets the filter bar visibility property and the label's caption to be shown
		 * @param {string} sFilterBarText the selected filter value
		 * @private
		 */
		_updateFilterBar: function(sFilterBarText) {
			var oViewModel = this.getModel("masterView");
			oViewModel.setProperty("/isFilterBarVisible", (this._oListFilterState.aFilter.length > 0));
			oViewModel.setProperty("/filterBarLabel", this.getResourceBundle().getText("masterFilterBarText", [sFilterBarText]));
		},

		/* =========================================================== */
		// Handles date filter
		/* =========================================================== */
		handleDate1Change: function(oEvent) {
			var sValue = oEvent.getParameters().value;
			var dt2 = sValue.split("-");
			this.date1 = dt2[2] + '-' + dt2[1] + '-' + dt2[0];
		},
		handleDate2Change: function(oEvent) {
			var sValue = oEvent.getParameters().value;
			var dt2 = sValue.split("-");
			this.date2 = dt2[2] + '-' + dt2[1] + '-' + dt2[0];
		},
		onViewSettingsDialogResetFilters: function(oEvent) {
			sap.ui.getCore().byId("DP1").setValue("");
			this.date1 = "";
			sap.ui.getCore().byId("DP2").setValue("");
			this.date2 = "";
		}

	});

});
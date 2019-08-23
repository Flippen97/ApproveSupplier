/****************************************************/
// Filename: formatter.js
// Created: Jerushan Benjamin
// Change history:
// 18.4.2018 
/****************************************************/
jQuery.sap.require("sap.ca.ui.model.format.FormattingLibrary");
jQuery.sap.require("sap.ca.ui.model.format.FileSizeFormat");
jQuery.sap.require("sap.ca.ui.model.format.DateFormat");
sap.ui.define([], function() {
	"use strict";

	return {
		/**
		 * Rounds the currency value to 2 digits
		 *
		 * @public
		 * @param {string} sValue value to be formatted
		 * @returns {string} formatted currency value with 2 digits
		 */
		currencyValue: function(sValue) {
			if (!sValue) {
				return "";
			}

			return parseFloat(sValue).toFixed(2);
		},
		oResults:function(sValue) {
			if (!sValue) {
				return "";
			}
			else if(sValue == "001")
			{
				return "Approved";
			}
			else if(sValue == "002")
			{
				return "Rejected";
			}

			
		},

		date: function(value) {

			if (value) {
				var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: "dd-MM-yyyy"
				});
				return oDateFormat.format(new Date(value));
			} else {
				return value;
			}

		},

		resultSubSt: function(oEvt) {
			if (oEvt != "Workflow started") {
				oEvt = oEvt.substr(7, 11);
				return oEvt;
			} else if (oEvt == "Workflow started") {
				return oEvt;
			}

		},

		status: function(WiStat) {

			if (WiStat == "Ready")
				return "Success";
			else if (WiStat == "In Process")
				return "Warning";
			else if (WiStat == "Waiting")
				return "None";
			else if (WiStat == "Error")
				return "Error";
		},

		priority: function(WiPrio) {
			if (WiPrio === "5") {
				return "Medium";
			} else if (WiPrio === "1" || WiPrio === "2") {
				return "Very High";
			} else if (WiPrio === "3" || WiPrio === "4") {
				return "High";
			} else if (WiPrio === "6" || WiPrio === "7" || WiPrio === "8" || WiPrio === "9") {
				return "Low";
			}
		},

		priorityCheck: function(sValue) {
			// checking for priority medium
			if (sValue === "5") {
				return "Warning";
			} else if (sValue < 5) { // checking for priority High
				return "Error";
			} else { // checking for priority Low
				return "Success";
			}
		},
		formatAttachmentDesc: function(sDescription, sMimeType) {
			if (sDescription) {
				return sDescription;
			} else {
				return sMimeType;
			}
		},
		formatAttachmentIcon: function(sMimeType) {
			return sap.ca.ui.model.format.FormattingLibrary.formatAttachmentIcon(sMimeType);
		},
		formatAttachmentSize: function(sFileSize) {
			var formatter = sap.ca.ui.model.format.FileSizeFormat.getInstance();
			return formatter.format(sFileSize);
		},
		formatNoteDateTime: function(d) {
			if (d === null || d === "") {
				return "";
			} else {
				return sap.ca.ui.model.format.DateFormat.getDateTimeInstance({
					style: "medium"
				}).format(d);
			}
		},
		datechange: function(sValue) {
			if (!sValue) {
				return "";
			}
			if (typeof(sValue) === "object") {
				var date4 = sValue.toJSON();
				var date2 = date4.slice(0, 10).split('-');
				var date1 = date2[2] + '-' + date2[1] + '-' + date2[0];
				return date1;
			} else {
				var date2 = sValue.slice(0, 10).split("-");
				var date1 = date2[2] + '-' + date2[1] + '-' + date2[0];
				return date1;
			}

		}

	};

});
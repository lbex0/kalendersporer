sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox"
], function (Controller, MessageBox) {
    "use strict";

    return Controller.extend("kalenderui.controller.Login", {
        onLogin: function () {
            const oView = this.getView();
            const sUsername = oView.byId("usernameInput").getValue();
            const sPassword = oView.byId("passwordInput").getValue();

            if (sUsername === "admin" && sPassword === "password") {
                const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("calender");
                
            } else {
                MessageBox.error("Invalid username or password.");
            }
        },

        onUsernameChange: function (oEvent) {
            const sValue = oEvent.getParameter("value");
            console.log("Username changed to:", sValue);
        }
    });
});
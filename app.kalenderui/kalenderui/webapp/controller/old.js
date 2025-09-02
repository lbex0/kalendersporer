sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/core/date/UI5Date"
], function (Controller, JSONModel, MessageBox, UI5Date) {
    "use strict";

    const colors = {
        birthday: "Type07",     // Blue
        vacation: "Type02",     // Orange
        absence: "Type08",      // Green
        holiday: "Type01",      // Red
        meeting: "Type04"       // Default for meetings
    };

    let aOriginalPeople = [];

    return Controller.extend("kalenderui.controller.Calender", {
        onInit: function () {
            const oModel = new JSONModel();

            aOriginalPeople = [
                {
                    pic: "test-resources/sap/ui/documentation/sdk/images/John_Miller.png",
                    name: "John Miller",
                    role: "team member",
                    appointments: [
                        {
                            start: UI5Date.getInstance(2017, 0, 10, 9, 0),
                            end: UI5Date.getInstance(2017, 0, 10, 10, 0),
                            title: "Team Sync",
                            category: "Meeting",
                            type: colors.meeting
                        }
                    ],
                    headers: []
                },
                {
                    pic: "test-resources/sap/ui/documentation/sdk/images/Donna_Moore.jpg",
                    name: "Donna Moore",
                    role: "team member",
                    appointments: [
                        {
                            start: UI5Date.getInstance(2017, 0, 12, 16, 30),
                            end: UI5Date.getInstance(2017, 0, 22, 19, 0),
                            title: "Vacation",
                            category: "Vacation",
                            type: colors.vacation
                        },
                        {
                            start: UI5Date.getInstance(2017, 0, 1, 0, 0),
                            end: UI5Date.getInstance(2017, 0, 1, 0, 0),
                            title: "New Year's Eve",
                            category: "Holiday",
                            type: colors.holiday
                        }
                    ],
                    headers: []
                },
                {
                    pic: "sap-icon://employee",
                    name: "Anne Dodsworth",
                    role: "team member",
                    appointments: [
                        {
                            start: UI5Date.getInstance(2017, 0, 15, 9, 30),
                            end: UI5Date.getInstance(2017, 0, 15, 10, 30),
                            title: "Absence",
                            category: "Absence",
                            type: colors.absence,
                            tentative: false
                        },
                        {
                            start: UI5Date.getInstance(2017, 0, 15, 9, 30),
                            end: UI5Date.getInstance(2017, 0, 15, 10, 30),
                            title: "Birthday",
                            category: "Birthday",
                            type: colors.birthday,
                            tentative: true
                        },
                        {
                            start: UI5Date.getInstance(2017, 0, 1, 0, 0),
                            end: UI5Date.getInstance(2017, 0, 1, 0, 0),
                            title: "New Year's Eve",
                            category: "Holiday",
                            type: colors.holiday
                        }
                    ],
                    headers: []
                }
            ];

            oModel.setData({
                startDate: UI5Date.getInstance(2017, 0, 15, 8, 0),
                people: aOriginalPeople
            });

            this.getView().setModel(oModel);
        },

        handleAppointmentSelect: function (oEvent) 
        {
            const oAppointment = oEvent.getParameter("appointment");
            if (oAppointment) {
                const sSelected = oAppointment.getSelected() ? "selected" : "deselected";
                MessageBox.show(`'${oAppointment.getTitle()}' ${sSelected}. \nSelected appointments: ${this.byId("PC1").getSelectedAppointments().length}`);
            } else {
                const aAppointments = oEvent.getParameter("appointments");
                MessageBox.show(`${aAppointments.length} Appointments selected`);
            }
        },

        handleSelectionFinish: function (oEvent) 
        {
            const aSelectedKeys = oEvent.getSource().getSelectedKeys();
            this.byId("PC1").setBuiltInViews(aSelectedKeys);
        },

        onToggleTheme: function () 
        {
            const currentTheme = sap.ui.getCore().getConfiguration().getTheme();
            const newTheme = currentTheme.includes("dark") ? "sap_horizon" : "sap_horizon_dark";
            sap.ui.getCore().applyTheme(newTheme);
        },

        onSearchPeople: function () 
        {
            this._applyFilters();
        },

        onFilterAppointments: function () 
        {
            this._applyFilters();
        },

        onResetFilters: function () 
        {
            const oView = this.getView();
            oView.byId("searchField").setValue("");
            oView.byId("appointmentTypeFilter").setSelectedKey("");
            this._applyFilters();
        },

        _applyFilters: function () 
        {
            const oView = this.getView();
            const oModel = oView.getModel();

            const sSearchQuery = oView.byId("searchField").getValue().toLowerCase();
            const sCategory = oView.byId("appointmentTypeFilter").getSelectedKey();

            const aFiltered = aOriginalPeople
                .filter(person => person.name.toLowerCase().includes(sSearchQuery))
                .map(person => {
                    const filteredAppointments = sCategory
                        ? person.appointments.filter(app => app.category === sCategory)
                        : person.appointments;

                    return {
                        ...person,
                        appointments: filteredAppointments,
                        headers: person.headers || []
                    };
                })
                .filter(person => person.appointments.length > 0);

            oModel.setProperty("/people", aFiltered);
        }
    });
});
/* eslint-disable no-console */
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/core/date/UI5Date"
], function (Controller, JSONModel, MessageBox, UI5Date) {
    "use strict";

    const colors = {
        bursdag: "Type07",
        ferie: "Type02",
        fravær: "Type08",
        fridager: "Type01",
        meeting: "Type04"
    };

    return Controller.extend("kalenderui.controller.Calender", {
        onInit: function () {
            const oView = this.getView();
            const viewModel = new JSONModel({
                startDate: UI5Date.getInstance(2025, 0, 1),
                people: [],
                originalPeople: [] 
            });
            oView.setModel(viewModel);

            Promise.all([
                this._fetchEntity("/Ansatt"),
                this._fetchEntity("/Fraværssøknad"),
                this._fetchEntity("/Fridager"),
                this._fetchEntity("/Reiseplan")
            ]).then(([ansattData, fravaerData, fridagerData, reiseplanData]) => {
                const people = ansattData.map(person => ({
                    id: person.id,
                    pic: "sap-icon://employee",
                    name: person.navn,
                    role: person.avdeling,
                    appointments: [],
                    headers: []
                }));

                ansattData.forEach(person => {
                    const birthday = person.fødselsdato;
                    if (birthday) {
                        const [year, month, day] = birthday.split("-");
                        const birthdayDate = UI5Date.getInstance(2025, parseInt(month, 10) - 1, parseInt(day, 10));
                        const personData = people.find(p => p.id === person.id);
                        if (personData) {
                            personData.appointments.push({
                                start: birthdayDate,
                                end: birthdayDate,
                                title: "Bursdag",
                                category: "Bursdag",
                                type: colors.bursdag
                            });
                        }
                    }
                });

                fravaerData.forEach(entry => {
                    const person = people.find(p => p.id === entry.ansatt_ID);
                    if (person) {
                        person.appointments.push({
                            start: UI5Date.getInstance(...entry.fra_dato.split("-").map(Number)),
                            end: UI5Date.getInstance(...entry.til_dato.split("-").map(Number)),
                            title: entry.fraværstype,
                            category: "Fravær",
                            type: colors.fravær
                        });
                    }
                });

                fridagerData.forEach(day => {
                    people.forEach(person => {
                        person.appointments.push({
                            start: UI5Date.getInstance(...day.dato.split("-").map(Number)),
                            end: UI5Date.getInstance(...day.dato.split("-").map(Number)),
                            title: day.type,
                            category: "Fridager",
                            type: colors.fridager
                        });
                    });
                });

                reiseplanData.forEach(plan => {
                    const person = people.find(p => p.id === plan.ansatt_ID);
                    if (person) {
                        person.appointments.push({
                            start: UI5Date.getInstance(...plan.fra_dato.split("-").map(Number)),
                            end: UI5Date.getInstance(...plan.til_dato.split("-").map(Number)),
                            title: "Reise: " + plan.sted,
                            category: "Ferie",
                            type: colors.ferie
                        });
                    }
                });

                viewModel.setProperty("/people", people);
                viewModel.setProperty("/originalPeople", JSON.parse(JSON.stringify(people))); // Save original data
            }).catch(err => {
                console.error("Error fetching data:", err);
                MessageBox.error("Error fetching data. Please try again later.");
            });
        },

        _fetchEntity: async function (sPath) {
            try {
                const response = await fetch(`/odata/v4/kalender${sPath}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch data from ${sPath}: ${response.statusText}`);
                }
                const data = await response.json();
                console.log(`Data fetched from ${sPath}:`, data.value);
                return data.value;
            } catch (err) {
                console.error(`Error fetching data from ${sPath}:`, err);
                throw err;
            }
        },

        handleAppointmentSelect: function (oEvent) {
            const oAppointment = oEvent.getParameter("appointment");
            if (oAppointment) {
                const sSelected = oAppointment.getSelected() ? "selected" : "deselected";
                MessageBox.show(`'${oAppointment.getTitle()}' ${sSelected}.`);
            } else {
                const aAppointments = oEvent.getParameter("appointments");
                MessageBox.show(`${aAppointments.length} Appointments selected`);
            }
        },

        handleSelectionFinish: function (oEvent) {
            const aSelectedKeys = oEvent.getSource().getSelectedKeys();
            this.byId("PC1").setBuiltInViews(aSelectedKeys);
        },

        onToggleTheme: function () {
            const currentTheme = sap.ui.getCore().getConfiguration().getTheme();
            const newTheme = currentTheme.includes("dark") ? "sap_horizon" : "sap_horizon_dark";
            sap.ui.getCore().applyTheme(newTheme);
        },

        _applyFilters: function () {
            const oView = this.getView();
            const oModel = oView.getModel();
            const sSearchQuery = oView.byId("searchField").getValue().toLowerCase();
            const sCategory = oView.byId("appointmentTypeFilter").getSelectedKey();

            const aOriginalPeople = oModel.getProperty("/originalPeople") || [];
            const aFilteredPeople = aOriginalPeople
                .filter(person => {

                    const matchesSearch = person.name.toLowerCase().includes(sSearchQuery);

                    const filteredAppointments = sCategory
                        ? person.appointments.filter(app => app.category === sCategory)
                        : person.appointments;

                    return matchesSearch && filteredAppointments.length > 0;
                })
                .map(person => ({
                    ...person,
                    appointments: sCategory
                        ? person.appointments.filter(app => app.category === sCategory)
                        : person.appointments
                }));

            oModel.setProperty("/people", aFilteredPeople);
        },

        onSearchPeople: function () {
            this._applyFilters();
        },

        onFilterAppointments: function () {
            this._applyFilters();
        },

        onResetFilters: function () {
            const oView = this.getView();
            oView.byId("searchField").setValue("");
            oView.byId("appointmentTypeFilter").setSelectedKey("");

            const oModel = oView.getModel();
            const aOriginalPeople = oModel.getProperty("/originalPeople");
            oModel.setProperty("/people", JSON.parse(JSON.stringify(aOriginalPeople))); // Reset to original data
        }
    });
});
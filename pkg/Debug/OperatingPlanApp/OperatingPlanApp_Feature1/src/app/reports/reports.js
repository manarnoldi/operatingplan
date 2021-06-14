(function () {
    'use strict';

    angular
        .module('reports', [])
        .controller('reportsCtrl', ReportsCtrl);

    ReportsCtrl.$inject = ['$q', '$dialogConfirm', '$dialogAlert', 'plansSvc', 'settingsSvc', 'yearsSvc', 'reportsSvc', 'spinnerService', 'quartersSvc', 'growl'];
    function ReportsCtrl($q, $dialogConfirm, $dialogAlert, plansSvc, settingsSvc, yearsSvc, reportsSvc, spinnerService, quartersSvc, growl) {
        var ctrl = this;
        ctrl.isAdmin = false;
        ctrl.printReport = [];
        spinnerService.show('spinner1');
        var promises = [];
        promises.push(yearsSvc.getAllItems());
        promises.push(quartersSvc.getAllItems());
        promises.push(settingsSvc.checkIfCurrentUserIsAdmin());
        promises.push(plansSvc.getAllItems());

        $q
            .all(promises)
            .then(function (data) {
                ctrl.printReport = [];
                ctrl.years = data[0];
                ctrl.quarters = data[1];
                ctrl.isAdmin = data[2];
                ctrl.plans = data[3];

                ctrl.reporttypes = [
                    {
                        id: 1,
                        title: "Yearly"
                    },
                    {
                        id: 2,
                        title: "Quarterly"
                    }
                ];
            })
            .catch(function (error) {
                growl.error(error);
            })
            .finally(function () {
                spinnerService.closeAll();
            });

        ctrl.clearLoadedReport = () => {
            ctrl.printReport = [];
        };

        ctrl.loadReport = () => {
            if (!ctrl.plan) {
                $dialogAlert('Select the plan and load report before printing the report!', 'Important Information Missing');
                return;
            } else if (!ctrl.year) {
                $dialogAlert('Select the year and load report before printing the report!', 'Important Information Missing');
                return;
            } else if (!ctrl.reporttype) {
                $dialogAlert('Select the year and load report before printing the report!', 'Important Information Missing');
                return;
            } else if (ctrl.reporttype.id == 2 && !ctrl.quarter) {
                $dialogAlert('Select the year and load report before printing the report!', 'Important Information Missing');
                return;
            }
            spinnerService.show('spinner1');
            var rptproms = [];
            if (ctrl.reporttype.id == 1) {
                rptproms.push(reportsSvc.getYearlyReport(ctrl.plan, ctrl.year));
            } else {
                rptproms.push(reportsSvc.getQuarterlyReport(ctrl.plan, ctrl.year, ctrl.quarter));
            }

            ctrl.printReport = [];

            $q
                .all(rptproms)
                .then(function (report) {
                    ctrl.printReport = report[0];
                })
                .catch(function (error) {
                    growl.error(error);
                })
                .finally(function () {
                    spinnerService.closeAll();
                });
        };

        function printYearlyReport(reportTitle) {
            var plandatarows = [];
            plandatarows.push([
                { text: "Deliverable", style: "tableHeader" },
                { text: "Accountable", style: "tableHeader" },
                { text: "Indicators", style: "tableHeader" },
                { text: "Year Target", style: "tableHeader" },
                { text: "RAG", style: "tableHeader" },
                { text: "Review", style: "tableHeader" }
            ]);
            var currentCategory = "";
            _.forEach(ctrl.printReport, (rpt) => {
                var row = [];
                if (currentCategory != rpt.category.abbr) {
                    row.push({ text: rpt.category.categoryno + " " + rpt.category.title, colSpan: 6, style: 'tableHeader' }, {}, {}, {}, {}, {});
                    plandatarows.push(row);
                }
                currentCategory = rpt.category.abbr;
                row = [];
                row.push({ text: rpt.actionno + ". " + rpt.actionname }, { text: rpt.accountable.title },
                    { text: rpt.indicators }, { text: rpt.target }, {
                    text: "",
                    style: rpt.ragrating == "Red" ? "ragRatingRed" : rpt.ragrating == "Amber" ? "ragRatingAmber" : rpt.ragrating == "Green" ? "ragRatingGreen" : "ragRatingDefault1"
                }, { text: rpt.review });
                plandatarows.push(row);
            });


            var docDefinition = {
                header: function (currentPage, pageCount, pageSize) {
                    return [
                        {
                            style: 'topHeader',
                            table: {
                                widths: ['*'],
                                headerRows: 0,
                                body: [
                                    [
                                        { text: reportTitle.toUpperCase(), style: 'topHeader', alignment: 'left' }
                                    ]
                                ]
                            },
                            layout: 'noBorders'
                        }
                    ]
                },
                footer: function (currentPage, pageCount) {
                    return [
                        { text: "Page " + currentPage.toString() + ' of ' + pageCount, alignment: 'center', style: 'footer' }
                    ]
                },
                content: [
                    [
                        {
                            style: 'table',
                            headerRows: 1,
                            table: {
                                widths: [175, 60, '*', '*', 20, 250],
                                body: plandatarows,
                                dontBreakRows: true
                            },
                            layout: {
                                paddingLeft: function (i, node) { return 4; },
                                paddingRight: function (i, node) { return 4; },
                                paddingTop: function (i, node) { return 3; },
                                paddingBottom: function (i, node) { return 3; }
                            }
                        }
                    ]
                ],
                pageOrientation: 'landscape',
                pageSize: 'A4',
                pageMargins: [30, 40, 30, 40],
                styles: {
                    topHeader: {
                        fontSize: 12,
                        bold: true,
                        margin: [15, 5, 0, 0],
                        alignment: 'left'
                    },
                    table: {
                        fontSize: 8,
                        alignment: 'left',
                        color: 'black',
                        margin: [0, 5, 0, 15]
                    },
                    tableHeader: {
                        fontSize: 10,
                        alignment: 'left',
                        color: 'black',
                        bold: true,
                        margin: [0, 5, 0, 5]
                    },
                    header: {
                        fontSize: 12,
                        bold: true,
                        margin: [0, 10, 0, 15],
                        alignment: 'left'
                    },
                    footer: {
                        fontSize: 10,
                        padding: [20, 25, 20, 17],
                        alignment: 'center'
                    },
                    ragRatingRed: {
                        fillColor: 'red'
                    },
                    ragRatingAmber: {
                        fillColor: '#FFBF00'
                    },
                    ragRatingGreen: {
                        fillColor: 'green'
                    },
                    ragRatingDefault: {
                        fillColor: 'null'
                    }
                },
                info: {
                    title: reportTitle
                }
            };
            pdfMake.createPdf(docDefinition).open();
        }

        function printQuarterlyReport(reportTitle) {
            var plandatarows = [];
            plandatarows.push([
                { text: "Deliverable", style: "tableHeader" },
                { text: "RAG", style: "tableHeader" }
            ]);
            var currentCategory = "";
            _.forEach(ctrl.printReport, (rpt) => {
                var row = [];
                if (currentCategory != rpt.category.abbr) {
                    row.push({ text: rpt.category.categoryno + " " + rpt.category.title, colSpan: 2, style: 'tableHeader' }, {});
                    plandatarows.push(row);
                }
                currentCategory = rpt.category.abbr;
                row = [];
                row.push({ text: rpt.actionno + ". " + rpt.actionname }, {
                    text: "",
                    style: rpt.ragrating == "Red" ? "ragRatingRed" : rpt.ragrating == "Amber" ? "ragRatingAmber" : rpt.ragrating == "Green" ? "ragRatingGreen" : "ragRatingDefault1"
                });
                plandatarows.push(row);
            });


            var docDefinition = {
                header: function (currentPage, pageCount, pageSize) {
                    return [
                        {
                            style: 'topHeader',
                            table: {
                                widths: ['*'],
                                headerRows: 0,
                                body: [
                                    [
                                        { text: reportTitle.toUpperCase(), style: 'topHeader', alignment: 'left' }
                                    ]
                                ]
                            },
                            layout: 'noBorders'
                        }
                    ]
                },
                footer: function (currentPage, pageCount) {
                    return [
                        { text: "Page " + currentPage.toString() + ' of ' + pageCount, alignment: 'center', style: 'footer' }
                    ]
                },
                content: [
                    [
                        {
                            style: 'table',
                            headerRows: 1,
                            table: {
                                widths: ['*', 50],
                                body: plandatarows,
                                dontBreakRows: true
                            },
                            layout: {
                                paddingLeft: function (i, node) { return 4; },
                                paddingRight: function (i, node) { return 4; },
                                paddingTop: function (i, node) { return 3; },
                                paddingBottom: function (i, node) { return 3; }
                            }
                        }
                    ]
                ],
                pageOrientation: 'landscape',
                pageSize: 'A4',
                pageMargins: [30, 40, 30, 40],
                styles: {
                    topHeader: {
                        fontSize: 14,
                        bold: true,
                        margin: [15, 5, 0, 0],
                        alignment: 'left'
                    },
                    table: {
                        fontSize: 10,
                        alignment: 'left',
                        color: 'black',
                        margin: [0, 5, 0, 15]
                    },
                    tableHeader: {
                        fontSize: 12,
                        alignment: 'left',
                        color: 'black',
                        bold: true,
                        margin: [0, 5, 0, 5]
                    },
                    header: {
                        fontSize: 12,
                        bold: true,
                        margin: [0, 10, 0, 15],
                        alignment: 'left'
                    },
                    footer: {
                        fontSize: 10,
                        padding: [20, 25, 20, 17],
                        alignment: 'center'
                    },
                    ragRatingRed: {
                        fillColor: 'red'
                    },
                    ragRatingAmber: {
                        fillColor: '#FFBF00'
                    },
                    ragRatingGreen: {
                        fillColor: 'green'
                    },
                    ragRatingDefault: {
                        fillColor: 'null'
                    }
                },
                info: {
                    title: reportTitle
                }
            };
            pdfMake.createPdf(docDefinition).open();
        }

        ctrl.printLoadedReport = () => {
            if (!ctrl.plan) {
                $dialogAlert('Select the plan and load report before printing the report!', 'Important Information Missing');
                return;
            } else if (!ctrl.year) {
                $dialogAlert('Select the year and load report before printing the report!', 'Important Information Missing');
                return;
            } else if (!ctrl.reporttype) {
                $dialogAlert('Select the year and load report before printing the report!', 'Important Information Missing');
                return;
            } else if (!ctrl.printReport.length < 0) {
                $dialogAlert('Load the report before printing!', 'Important Information Missing');
                return;
            }

            if (ctrl.reporttype.id == 1) {
                printYearlyReport(ctrl.plan.title + " Year " + ctrl.year.title + " Annual Review");
            } else if (ctrl.reporttype.id == 2) {
                printQuarterlyReport(ctrl.plan.title + " Year " + ctrl.year.title + " " + ctrl.quarter.title + " Dashboard");
            }
        };

    }
})();
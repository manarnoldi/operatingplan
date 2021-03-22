(function () {
    'use strict';

    angular
        .module('planaction', [])
        .controller('planactionCtrl', PlanActionCtrlFunction);

    PlanActionCtrlFunction.$inject = ['$q', '$routeParams', '$dialog', '$dialogAlert', '$dialogConfirm', 'actionTargetsSvc', 'targetOutputsSvc', 'yearsSvc', 'planActionsSvc','teamsSvc', 'spinnerService', 'growl'];
    function PlanActionCtrlFunction($q, $routeParams, $dialog, $dialogAlert, $dialogConfirm, actionTargetsSvc, targetOutputsSvc, yearsSvc, planActionsSvc, teamsSvc, spinnerService, growl) {
        var ctrl = this;
        spinnerService.show('spinner1');
        ctrl.actionid = parseInt($routeParams.id);
        ctrl.searchstatus = $routeParams.searchstatus;
        ctrl.hostWebUrl = _spPageContextInfo.webAbsoluteUrl;
        ctrl.outputs = [];
        ctrl.progress = [];
        var promises = [];
        promises.push(planActionsSvc.getItemById(ctrl.actionid));
        promises.push(actionTargetsSvc.getAllItems(ctrl.actionid));
        promises.push(yearsSvc.getAllItems());
        promises.push(teamsSvc.getAllItems());
        $q
            .all(promises)
            .then(function (results) {
                ctrl.action = results[0];
                ctrl.actiontargets = results[1];
                ctrl.years = results[2];
                ctrl.teams = results[3];
                ctrl.statuses = ["Active", "Completed"];
                ctrl.currenttarget = "";
                ctrl.config = {
                    checkBoxes: true,
                    dynamicTitle: false,
                    showUncheckAll: false,
                    showCheckAll: false
                };
            })
            .catch(function (error) {
                growl.error(error);
            })
            .finally(function () {
                spinnerService.closeAll();
            });

        ctrl.addYearTarget = function () {
            var passdata = {};
            passdata.years = ctrl.years;
            passdata.update = false;
            var targetsDW = { scopeVariableName: 'passdata', dataObject: passdata };
            $dialog('app/planaction/planaction-target.html', 'lg', targetsDW)
                .then(function (target) {
                    target.actionid = ctrl.actionid;
                    target.actionno = ctrl.action.actionno;
                    spinnerService.show('spinner1');
                    actionTargetsSvc
                        .AddItem(target)
                        .then(function (res) {
                            ctrl.actiontargets = res;
                            $dialogAlert('Action year target added successfully!', 'Successful Transaction');
                        })
                        .catch(function (error) {
                            $dialogAlert(error, 'Unable to add alert record');
                        })
                        .finally(function () {
                            spinnerService.closeAll();
                        });
                });
        };

        ctrl.updateYearTarget = function (target) {
            var passdata = {};
            passdata.years = ctrl.years;
            passdata.year = target.year;
            passdata.target = target.target;
            passdata.id = target.id;
            passdata.update = true;
            var targetsDW = { scopeVariableName: 'passdata', dataObject: passdata };
            $dialog('app/planaction/planaction-target.html', 'lg', targetsDW)
                .then(function (target) {
                    target.actionid = ctrl.actionid;
                    target.actionno = ctrl.action.actionno;
                    spinnerService.show('spinner1');
                    actionTargetsSvc
                        .UpdateItem(target)
                        .then(function (res) {
                            ctrl.actiontargets = res;
                            $dialogAlert('Action year target updated successfully!', 'Successful Transaction');
                        })
                        .catch(function (error) {
                            $dialogAlert(error, 'Unsuccessful Transaction');
                        })
                        .finally(function () {
                            spinnerService.closeAll();
                        });
                });
        };

        ctrl.deleteYearTarget = function (target) {
            $dialogConfirm('Delete year target?', 'Confirm Transaction')
                .then(function () {
                    spinnerService.show('spinner1');
                    actionTargetsSvc
                        .DeleteItem(target.id)
                        .then(function (res) {
                            ctrl.actiontargets = res;
                            $dialogAlert('Action year target deleted successfully!', 'Successful Transaction');
                        })
                        .catch(function (error) {
                            $dialogAlert(error, 'Unsuccessful Transaction');
                        })
                        .finally(function () {
                            spinnerService.closeAll();
                        });
                });
        };

        ctrl.showOutputs = function (target) {
            ctrl.currenttarget = "";
            ctrl.currenttarget = target;
            spinnerService.show('spinner1');
            targetOutputsSvc
                .getAllItems(target.id)
                .then(function (res) {
                    ctrl.outputs = [];
                    ctrl.progress = [];
                    ctrl.outputs = res;
                    $dialogAlert('[' + res.length + '] outputs have been found for target.', 'Successful Transaction');
                })
                .catch(function (error) {
                    $dialogAlert(error, 'Unsuccessful Transaction');
                })
                .finally(function () {
                    spinnerService.closeAll();
                });
        };

        ctrl.addOutput = function () {
            if (ctrl.currenttarget == "") {
                $dialogAlert("Kindly select the target yeat details.", "Missing Details");
                return;
            }
            var output = {};
            output.target = ctrl.currenttarget;
            output.teams = ctrl.teams;
            output.update = false;
            output.hostWebUrl = ctrl.hostWebUrl;
            output.otherteams = [];
            output.statuses = ctrl.statuses;
            output.status = "Active";
            var outputDW = { scopeVariableName: 'output', dataObject: output };
            $dialog('app/planaction/planaction-output.html', 'lg', outputDW)
                .then(function (output) {
                    spinnerService.show('spinner1');
                    targetOutputsSvc
                        .AddItem(output)
                        .then(function (res) {
                            ctrl.outputs = res;
                            $dialogAlert('Yearl target output added successfully!', 'Successful Transaction');
                        })
                        .catch(function (error) {
                            $dialogAlert(error, 'Unable to add alert record');
                        })
                        .finally(function () {
                            spinnerService.closeAll();
                        });
                });
        };
    }
})();
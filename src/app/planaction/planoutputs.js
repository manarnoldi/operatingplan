(function () {
    'use strict';

    angular
        .module('planoutputs', [])
        .controller('planoutputsCtrl', PlanOutputsCtrlFunction);

    PlanOutputsCtrlFunction.$inject = ['$q', '$dialog', '$dialogAlert', '$dialogConfirm', 'targetOutputsSvc', 'outputProgressSvc', 'yearsSvc', 'quartersSvc', 'plansSvc', 'teamsSvc','settingsSvc', 'spinnerService', 'growl'];
    function PlanOutputsCtrlFunction($q, $dialog, $dialogAlert, $dialogConfirm, targetOutputsSvc, outputProgressSvc, yearsSvc, quartersSvc, plansSvc, teamsSvc, settingsSvc, spinnerService, growl) {
        var ctrl = this;
        ctrl.isAdmin = false;
        spinnerService.show('spinner1');
        ctrl.currentUserId = _spPageContextInfo.userId;
        ctrl.tableOptions = {
            "scrollX": true
        };

        ctrl.hostWebUrl = _spPageContextInfo.webAbsoluteUrl;
        ctrl.outputs = [];
        ctrl.progress = [];
        var promises = [];

        promises.push(teamsSvc.getAllItems());
        promises.push(quartersSvc.getAllItems());
        promises.push(plansSvc.getAllItems());
        promises.push(yearsSvc.getAllItems());
        promises.push(settingsSvc.checkIfCurrentUserIsAdmin());

        $q
            .all(promises)
            .then(function (results) {
                ctrl.teams = results[0];
                ctrl.quarters = results[1];
                ctrl.statuses = ["Active", "Completed"];
                ctrl.currentoutput = "";
                ctrl.plans = results[2];
                ctrl.years = results[3];
                ctrl.isAdmin = results[4];
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

        ctrl.searchExpectedOutputs = () => {
            if (!ctrl.plan) {
                $dialogAlert('Select the plan to search!', 'Important Information');
                return;
            } else if (!ctrl.year) {
                $dialogAlert('Select the year to search!', 'Important Information');
                return;
            }
            spinnerService.show('spinner1');
            targetOutputsSvc
                .getPlanOutputs(ctrl.plan.id, ctrl.year.id, ctrl.individual)
                .then(function (outs) {
                    ctrl.outputs = outs;
                    $dialogAlert('[' + outs.length + '] outputs have been found for target.', 'Successful Transaction');
                })
                .catch(function (error) {
                    $dialogAlert(error, 'Unsuccessful Transaction');
                })
                .finally(function () {
                    spinnerService.closeAll();
                });
        };

        ctrl.showOutputs = function (target) {
            ctrl.currenttarget = "";
            ctrl.currentoutput = "";
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
                $dialogAlert("Kindly select the target year details.", "Missing Details");
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
            output.num = targetOutputsSvc.getHighestNum(ctrl.currenttarget.id);
            var outputDW = { scopeVariableName: 'output', dataObject: output };
            $dialog('app/planaction/planaction-output.html', 'lg', outputDW)
                .then(function (output) {
                    if (output.individual.length != 1) {
                        $dialogAlert('Select only one responsible individual.', 'Successful Transaction');
                        return;
                    }
                    spinnerService.show('spinner1');
                    targetOutputsSvc
                        .AddItem(output)
                        .then(function (res) {
                            ctrl.outputs = res;
                            $dialogAlert('Year target output added successfully!', 'Successful Transaction');
                        })
                        .catch(function (error) {
                            $dialogAlert(error, 'Unable to add alert record');
                        })
                        .finally(function () {
                            spinnerService.closeAll();
                        });
                });
        };

        ctrl.updateOutput = function (out) {
            var output = {};
            output.leadteam = out.leadteam;
            output.output = out.output;
            output.target = ctrl.currenttarget;
            output.teams = ctrl.teams;
            output.update = true;
            output.hostWebUrl = ctrl.hostWebUrl;
            output.otherteams = out.otherteams;
            output.statuses = ctrl.statuses;
            output.status = out.status;
            output.num = out.num;
            output.responsible = out.responsible;
            output.id = out.id;

            var outputDW = { scopeVariableName: 'output', dataObject: output };
            $dialog('app/planaction/planaction-output.html', 'lg', outputDW)
                .then(function (output) {
                    if (output.individual && output.responsible) {
                        $dialogAlert('We can only have one responsible individual. Delete the saved individual and select a new one to update.', 'Successful Transaction');
                        return;
                    }
                    spinnerService.show('spinner1');
                    targetOutputsSvc
                        .UpdateItem(output)
                        .then(function (res) {
                            ctrl.outputs = res;
                            $dialogAlert('Year target output updated successfully!', 'Successful Transaction');
                        })
                        .catch(function (error) {
                            $dialogAlert(error, 'Unsuccessful Transaction');
                        })
                        .finally(function () {
                            spinnerService.closeAll();
                        });
                });
        };

        ctrl.removeIndividual = function (individualId, outputId) {
            $dialogConfirm('Remove user from target output?', 'Confirm Transaction')
                .then(function () {
                    spinnerService.show('spinner1');
                    targetOutputsSvc
                        .removeRespIndividual(individualId, outputId)
                        .then(function (res) {
                            ctrl.outputs = res;
                            $dialogAlert('Individual removed from target output successfully!', 'Successful Transaction');
                        })
                        .catch(function (error) {
                            $dialogAlert(error, 'Unsuccessful Transaction');
                        })
                        .finally(function () {
                            spinnerService.closeAll();
                        });
                });
        };

        ctrl.deleteOutput = function (output) {
            $dialogConfirm('Delete target output?', 'Confirm Transaction')
                .then(function () {
                    spinnerService.show('spinner1');
                    targetOutputsSvc
                        .DeleteItem(output.id)
                        .then(function (res) {
                            ctrl.outputs = res;
                            $dialogAlert('Target output deleted successfully!', 'Successful Transaction');
                        })
                        .catch(function (error) {
                            $dialogAlert(error, 'Unsuccessful Transaction');
                        })
                        .finally(function () {
                            spinnerService.closeAll();
                        });
                });
        };

        ctrl.showProgress = function (output) {
            ctrl.currentoutput = "";
            ctrl.currentoutput = output;
            spinnerService.show('spinner1');
            outputProgressSvc
                .getAllItems(output.id)
                .then(function (res) {
                    ctrl.progress = [];
                    ctrl.progress = res;
                    $dialogAlert('[' + res.length + '] progresses have been found for output.', 'Successful Transaction');
                })
                .catch(function (error) {
                    $dialogAlert(error, 'Unsuccessful Transaction');
                })
                .finally(function () {
                    spinnerService.closeAll();
                });
        };

        ctrl.addProgress = function () {
            if (ctrl.currentoutput == "") {
                $dialogAlert("Kindly select the target output details in the list above.", "Missing Details");
                return;
            }
            var progress = {};
            progress.output = ctrl.currentoutput;
            progress.update = false;
            progress.hostWebUrl = ctrl.hostWebUrl;
            progress.quarters = _.orderBy(ctrl.quarters, ['title', 'asc']);
            var progressDW = { scopeVariableName: 'progress', dataObject: progress };
            $dialog('app/planaction/planaction-progress.html', 'lg', progressDW)
                .then(function (progress) {
                    spinnerService.show('spinner1');
                    outputProgressSvc
                        .AddItem(progress)
                        .then(function (res) {
                            ctrl.progress = res;
                            $dialogAlert('Expected output progress added successfully!', 'Successful Transaction');
                        })
                        .catch(function (error) {
                            $dialogAlert(error, 'Unable to add alert record');
                        })
                        .finally(function () {
                            spinnerService.closeAll();
                        });
                });
        };

        ctrl.updateProgress = function (prog) {
            if (ctrl.currentoutput == "") {
                $dialogAlert("Kindly select the target output details in the list above.", "Missing Details");
                return;
            }
            var progress = {};
            progress.output = ctrl.currentoutput;
            progress.update = true;
            progress.hostWebUrl = ctrl.hostWebUrl;
            progress.quarters = _.orderBy(ctrl.quarters, ['title', 'asc']);

            progress.notes = prog.notes;
            progress.quarter = prog.quarter;
            progress.progresstext = prog.progresstext;
            progress.progressno = prog.progressno;
            progress.id = prog.id;

            var progressDW = { scopeVariableName: 'progress', dataObject: progress };
            $dialog('app/planaction/planaction-progress.html', 'lg', progressDW)
                .then(function (progress) {
                    spinnerService.show('spinner1');
                    outputProgressSvc
                        .UpdateItem(progress)
                        .then(function (res) {
                            ctrl.progress = res;
                            $dialogAlert('Expected output progress updated successfully!', 'Successful Transaction');
                        })
                        .catch(function (error) {
                            $dialogAlert(error, 'Unable to add alert record');
                        })
                        .finally(function () {
                            spinnerService.closeAll();
                        });
                });
        };

        ctrl.deleteProgress = function (progress) {
            $dialogConfirm('Delete output progress?', 'Confirm Transaction')
                .then(function () {
                    spinnerService.show('spinner1');
                    outputProgressSvc
                        .DeleteItem(progress.id)
                        .then(function (res) {
                            ctrl.progress = res;
                            $dialogAlert('Expected output progress deleted successfully!', 'Successful Transaction');
                        })
                        .catch(function (error) {
                            $dialogAlert(error, 'Unsuccessful Transaction');
                        })
                        .finally(function () {
                            spinnerService.closeAll();
                        });
                });
        };

        ctrl.showAllOutputs = () => {
            ctrl.allOutputs = !ctrl.allOutputs;
        };
    }
})();
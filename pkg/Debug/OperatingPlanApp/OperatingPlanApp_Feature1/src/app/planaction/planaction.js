(function () {
    'use strict';

    angular
        .module('planaction', [])
        .controller('planactionCtrl', PlanActionCtrlFunction);

    PlanActionCtrlFunction.$inject = ['$q', '$route', '$routeParams', '$dialog', '$dialogAlert', '$dialogConfirm', 'actionTargetsSvc', 'targetOutputsSvc', 'outputProgressSvc', 'yearsSvc',
        'quartersSvc', 'qReviewsSvc', 'plansSvc', 'planActionsSvc', 'teamsSvc', 'accountableSvc', 'spinnerService', 'growl'];
    function PlanActionCtrlFunction($q, $route, $routeParams, $dialog, $dialogAlert, $dialogConfirm, actionTargetsSvc, targetOutputsSvc, outputProgressSvc, yearsSvc,
        quartersSvc, qReviewsSvc, plansSvc, planActionsSvc, teamsSvc, accountableSvc, spinnerService, growl) {
        var ctrl = this;
        spinnerService.show('spinner1');
        ctrl.actionid = parseInt($routeParams.id);
        ctrl.currentUserId = _spPageContextInfo.userId;
        ctrl.tableOptions = {
            "scrollX": true
        };
        ctrl.ragratingcolor = 'default';
        ctrl.searchstatus = $routeParams.searchstatus;
        ctrl.hostWebUrl = _spPageContextInfo.webAbsoluteUrl;
        ctrl.paramview = $route.current.$$route.paramview;
        ctrl.accountable = false;
        ctrl.allOutputs = false;
        ctrl.outputs = [];
        ctrl.progress = [];
        ctrl.quarterreviews = [];
        var promises = [];
        promises.push(planActionsSvc.getItemById(ctrl.actionid));
        promises.push(actionTargetsSvc.getAllItems(ctrl.actionid));
        promises.push(yearsSvc.getAllItems());
        promises.push(teamsSvc.getAllItems());
        promises.push(quartersSvc.getAllItems());
        promises.push(accountableSvc.checkIfAccountable(ctrl.currentUserId, ctrl.actionid));
        promises.push(plansSvc.getAllItems());

        $q
            .all(promises)
            .then(function (results) {
                ctrl.action = results[0];
                ctrl.actiontargets = results[1];
                ctrl.years = results[2];
                ctrl.teams = results[3];
                ctrl.quarters = results[4];
                ctrl.statuses = ["Active", "Completed"];
                ctrl.currenttarget = "";
                ctrl.currentoutput = "";
                ctrl.accountable = results[5];
                ctrl.plans = results[6];

                ctrl.config = {
                    checkBoxes: true,
                    dynamicTitle: false,
                    showUncheckAll: false,
                    showCheckAll: false
                };

                var activeyear = _.find(ctrl.years, ['active', true]);
                if (activeyear) {
                    ctrl.currenttarget = _.find(ctrl.actiontargets, function (t) {
                        return t.year.id == activeyear.id;
                    });
                }

                if (ctrl.currenttarget) {
                    var outproms = [];
                    outproms.push(targetOutputsSvc.getAllItems(ctrl.currenttarget.id));
                    outproms.push(qReviewsSvc.getAllItems(ctrl.currenttarget.id));

                    $q
                        .all(outproms)
                        .then(function (res) {
                            var progressProms = [];
                            var resoutputs = res[0];
                            _.forEach(resoutputs, (out) => {
                                progressProms.push(outputProgressSvc.getMaximumProgress(out.id))
                            })
                            $q
                                .all(progressProms)
                                .then(function (progRes) {
                                    for (var i = 0; i < progRes.length; i++) {
                                        resoutputs[i].progress = progRes[i];
                                    }
                                    ctrl.outputs = resoutputs;
                                    ctrl.quarterreviews = res[1];
                                    //$dialogAlert('[' + res.length + '] outputs have been found for target.', 'Successful Transaction');
                                })
                                .catch(function (error) {
                                    console.log(error);
                                    deferplanOuts.reject(error);
                                })
                                .finally(function () {
                                    spinnerService.closeAll();
                                });
                        })
                        .catch(function (error) {
                            $dialogAlert(error, 'Unsuccessful Transaction');
                        })
                        .finally(function () {
                            spinnerService.closeAll();
                        });
                } else {
                    spinnerService.closeAll();
                }
            })
            .catch(function (error) {
                growl.error(error);
            });

        ctrl.searchExpectedOutputs = () => {
            if (!ctrl.plan) {
                $dialogAlert('Select the plan to search!', 'Important Information');
                return;
            }
            spinnerService.show('spinner1');
            targetOutputsSvc
                .getPlanOutputs(ctrl.plan.id)
                .then(function (outs) {
                    ctrl.outputs = outs;
                    $dialogAlert('[' + res.length + '] outputs have been found for target.', 'Successful Transaction');
                })
                .catch(function (error) {
                    $dialogAlert(error, 'Unsuccessful Transaction');
                })
                .finally(function () {
                    spinnerService.closeAll();
                });
        };

        ctrl.updateRagRating = function (actid, col) {
            if (!ctrl.accountable) {
                $dialogAlert('You are not the accountable for the deliverable hence cannot update it!', 'Important Information');
                return;
            }

            $dialogConfirm('Update target rating to color: ' + col + '?', 'Confirm Transaction')
                .then(function () {
                    spinnerService.show('spinner1');
                    planActionsSvc
                        .updateRagRating(actid, col)
                        .then(function (res) {
                            ctrl.action.ragrating = col;
                            $dialogAlert('Target rating color updated successfully!', 'Successful Transaction');
                        })
                        .catch(function (error) {
                            growl.error(error);
                        })
                        .finally(function () {
                            spinnerService.closeAll();
                        });
                });
        };

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
                            ctrl.action.ragrating = target.ragrating;
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
            passdata.review = target.review;
            passdata.ragrating = target.ragrating;
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
                            ctrl.action.ragrating = target.ragrating;
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

        ctrl.addQuarterReview = function () {
            if (ctrl.currenttarget == "") {
                $dialogAlert("Kindly select the target year details.", "Missing Details");
                return;
            }

            var review = {};
            review.update = false;
            review.target = ctrl.currenttarget;
            review.quarters = ctrl.quarters;

            var reviewDW = { scopeVariableName: 'review', dataObject: review };
            $dialog('app/planaction/planaction-qreview.html', 'lg', reviewDW)
                .then(function (review) {
                    spinnerService.show('spinner1');
                    qReviewsSvc
                        .AddItem(review)
                        .then(function (res) {
                            ctrl.quarterreviews = res;
                            $dialogAlert('Action target quarter review added successfully!', 'Successful Transaction');
                        })
                        .catch(function (error) {
                            $dialogAlert(error, 'Unable to add alert record');
                        })
                        .finally(function () {
                            spinnerService.closeAll();
                        });
                });
        };

        ctrl.updateQuarterReview = function (rev) {
            var review = {};
            review.update = true;
            review.target = ctrl.currenttarget;
            review.quarters = ctrl.quarters;
            review.quarter = rev.quarter;
            review.ragrating = rev.ragrating;
            review.review = rev.review;
            review.id = rev.id;

            var reviewDW = { scopeVariableName: 'review', dataObject: review };
            $dialog('app/planaction/planaction-qreview.html', 'lg', reviewDW)
                .then(function (review) {
                    spinnerService.show('spinner1');
                    qReviewsSvc
                        .UpdateItem(review)
                        .then(function (res) {
                            ctrl.quarterreviews = res;
                            $dialogAlert('Action target quarter review updated successfully!', 'Successful Transaction');
                        })
                        .catch(function (error) {
                            $dialogAlert(error, 'Unsuccessful Transaction');
                        })
                        .finally(function () {
                            spinnerService.closeAll();
                        });
                });
        };

        ctrl.deleteQuarterReview = function (review) {
            $dialogConfirm('Delete target quarter review?', 'Confirm Transaction')
                .then(function () {
                    spinnerService.show('spinner1');
                    qReviewsSvc
                        .DeleteItem(review.id)
                        .then(function (res) {
                            ctrl.quarterreviews = res;
                            $dialogAlert('Action target quarter review deleted successfully!', 'Successful Transaction');
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
            ctrl.quarterreviews = [];
            ctrl.outputs = [];
            ctrl.progress = [];
            ctrl.currenttarget = "";
            ctrl.currentoutput = "";
            ctrl.currenttarget = target;
            spinnerService.show('spinner1');

            var outproms = [];
            outproms.push(targetOutputsSvc.getAllItems(target.id));
            outproms.push(qReviewsSvc.getAllItems(target.id));

            $q
                .all(outproms)
                .then(function (res) {
                    var progressProms = [];
                    var resoutputs = res[0];
                    _.forEach(resoutputs, (out) => {
                        progressProms.push(outputProgressSvc.getMaximumProgress(out.id))
                    })
                    $q
                        .all(progressProms)
                        .then(function (progRes) {
                            for (var i = 0; i < progRes.length; i++) {
                                resoutputs[i].progress = progRes[i];
                            }
                            ctrl.outputs = resoutputs;
                            ctrl.quarterreviews = res[1];
                            //$dialogAlert('[' + res.length + '] outputs have been found for target.', 'Successful Transaction');
                        })
                        .catch(function (error) {
                            console.log(error);
                            deferplanOuts.reject(error);
                        })
                        .finally(function () {
                            spinnerService.closeAll();
                        });
                })
                .catch(function (error) {
                    $dialogAlert(error, 'Unsuccessful Transaction');
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
(function () {
    'use strict';

    angular
        .module('actions', [])
        .controller('actionsCtrl', ActionsCtrl);

    ActionsCtrl.$inject = ['$q', '$dialogConfirm', '$dialogAlert', '$route', '$routeParams', '$location', '$dialog', 'plansSvc', 'accountableSvc', 'planCategorySvc', 'planActionsSvc', 'spinnerService', 'UtilService', 'growl'];
    function ActionsCtrl($q, $dialogConfirm, $dialogAlert, $route, $routeParams, $location, $dialog, plansSvc, accountableSvc, planCategorySvc, planActionsSvc, spinnerService, UtilService, growl) {
        var ctrl = this;
        ctrl.planid = parseInt($routeParams.planid);
        ctrl.links = UtilService.getAppShortcutlinks(7);
        ctrl.hostWebUrl = planActionsSvc.hostWebUrl;
        if (ctrl.action == 'list') {
            spinnerService.show('spinner1');
        }
        var promises = [];
        promises.push(plansSvc.getAllItems());
        if (ctrl.planid) {
            promises.push(planActionsSvc.getPlansSearched(ctrl.planid));
        }

        $q
            .all(promises)
            .then(function (data) {
                ctrl.plans = data[0];
                ctrl.statuses = ["Active", "Suspended"];
                if (ctrl.planid) {
                    ctrl.plan = _.find(ctrl.plans, ['id', ctrl.planid]);
                    ctrl.planactions = data[1];
                }
            })
            .catch(function (error) {
                growl.error(error);
            })
            .finally(function () {
                spinnerService.closeAll();
            });

        ctrl.searchPlanActions = () => {
            if (!ctrl.plan) {
                $dialogAlert("Kindly select the plan name.", "Missing Details");
                return;
            }
            spinnerService.show('spinner1');
            planActionsSvc
                .getPlansSearched(ctrl.plan.id)
                .then(function (actions) {
                    ctrl.planactions = actions;
                })
                .catch(function (error) {
                    growl.error(error);
                })
                .finally(function () {
                    spinnerService.closeAll();
                });
        };

        ctrl.addPlanAction = (action, id) => {
            spinnerService.show('spinner1');
            var proms = [];
            proms.push(accountableSvc.getAllItems());
            proms.push(planCategorySvc.getAllItems());

            $q
                .all(proms)
                .then(function (reslts) {
                    var pd = {};
                    pd.planaction = {};
                    pd.plans = ctrl.plans;
                    pd.statuses = ctrl.statuses;
                    pd.accountables = reslts[0];
                    pd.categories = reslts[1];

                    if (action == 'edit' && id && ctrl.planactions.length > 0) {
                        pd.planaction = _.find(ctrl.planactions, ['id', id]);
                    }
                    pd.planaction.action = action;

                    var targetsDW = { scopeVariableName: 'pd', dataObject: pd };
                    $dialog('app/adm-actions/actions-add.tpl.html', 'lg', targetsDW)
                        .then(function (planaction) {
                            $dialogConfirm(action == "edit" ? "Update Record?" : "Add Record?", 'Confirm Transaction')
                                .then(function () {
                                    spinnerService.show('spinner1');
                                    var updateProms = [];
                                    if (planaction.action == 'edit') {
                                        updateProms.push(planActionsSvc.UpdateItem(planaction));
                                    } else {
                                        updateProms.push(planActionsSvc.AddItem(planaction));
                                    }

                                    $q
                                        .all(updateProms)
                                        .then(function (res) {
                                            growl.success(action == "edit" ? "Record updated successfully!" : "Record added successfully!");
                                            $location.path("/listAdminActions/" + planaction.plan.id);
                                        })
                                        .catch(function (error) {
                                            growl.error(error);
                                        })
                                        .finally(function () {
                                            spinnerService.closeAll();
                                        });
                                });
                        });
                })
                .catch(function (error) {
                    growl.error(error);
                })
                .finally(function () {
                    spinnerService.closeAll();
                });
        };

        ctrl.DeleteRecord = function (id) {
            $dialogConfirm('Delete Record?', 'Confirm Transaction')
                .then(function () {
                    spinnerService.show('spinner1');
                    planActionsSvc
                        .DeleteItem(id)
                        .then(function (res) {
                            ctrl.planactions = res;
                            growl.success("Record deleted successfully!");
                        })
                        .catch(function (error) {
                            growl.error(error);
                        })
                        .finally(function () {
                            spinnerService.closeAll();
                        })
                });
        };
    }
})();
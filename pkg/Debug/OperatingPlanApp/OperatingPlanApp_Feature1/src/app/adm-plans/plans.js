(function () {
    'use strict';

    angular
        .module('plans', [])
        .controller('plansCtrl', PlansCtrl);

    PlansCtrl.$inject = ['$q', '$dialogConfirm', '$dialogAlert', '$route', '$routeParams', '$location', 'plansSvc', 'spinnerService', 'UtilService', 'growl'];
    function PlansCtrl($q, $dialogConfirm, $dialogAlert, $route, $routeParams, $location, plansSvc, spinnerService, UtilService, growl) {
        var ctrl = this;
        ctrl.plan = {};
        ctrl.action = $route.current.$$route.param;
        ctrl.links = UtilService.getAppShortcutlinks(6);
        ctrl.planId = $routeParams.id;
        ctrl.hostWebUrl = plansSvc.hostWebUrl;
        if (ctrl.action == 'list') {
            spinnerService.show('spinner1');
        }
        var promises = [];
        promises.push(plansSvc.getAllItems());

        $q
            .all(promises)
            .then(function (data) {
                ctrl.plans = data[0];      
                ctrl.plan.activeplan = false;
                if (ctrl.planId && ctrl.action == 'edit') {
                    ctrl.plan = _.find(ctrl.plans, function (t) {
                        return t.id == ctrl.planId;
                    });
                }
            })
            .catch(function (error) {
                growl.error(error);
            })
            .finally(function () {
                spinnerService.closeAll();
            });

        ctrl.changeStatus = function () {
            ctrl.plan.activeplan = !ctrl.plan.activeplan;
        };

        ctrl.AddRecord = function () {
            if (!ctrl.plan.title) {
                $dialogAlert("Kindly provide the plan title.", "Missing Details");
                return;
            } else if (!ctrl.plan.startdate) {
                $dialogAlert("Kindly provide the plan start date.", "Missing Details");
                return;
            } else if (!ctrl.plan.enddate) {
                $dialogAlert("Kindly provide the plan end date.", "Missing Details");
                return;
            } else if (!ctrl.plan.yearsspan) {
                $dialogAlert("Kindly provide the plan years span.", "Missing Details");
                return;
            }

            $dialogConfirm(ctrl.action == "edit" ? "Update Record?" : "Add Record?", 'Confirm Transaction')
                .then(function () {
                    spinnerService.show('spinner1');
                    var updateProms = [];
                    if (ctrl.action == 'edit') {
                        updateProms.push(plansSvc.UpdateItem(ctrl.plan));
                    } else {
                        updateProms.push(plansSvc.AddItem(ctrl.plan));
                    }

                    $q
                        .all(updateProms)
                        .then(function (res) {
                            growl.success(ctrl.action == "edit" ? "Record updated successfully!" : "Record added successfully!");
                            $location.path("/listAdminPlans");
                        })
                        .catch(function (error) {
                            growl.error(error);
                        })
                        .finally(function () {
                            spinnerService.closeAll();
                        });
                });
        };

        ctrl.DeleteRecord = function (id) {
            $dialogConfirm('Delete Record?', 'Confirm Transaction')
                .then(function () {
                    spinnerService.show('spinner1');
                    plansSvc
                        .DeleteItem(id)
                        .then(function (res) {
                            ctrl.quarters = res;
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
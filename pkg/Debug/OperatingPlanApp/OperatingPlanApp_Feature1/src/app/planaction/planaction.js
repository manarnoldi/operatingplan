(function () {
    'use strict';

    angular
        .module('planaction', [])
        .controller('planactionCtrl', PlanActionCtrlFunction);

    PlanActionCtrlFunction.$inject = ['$q', '$routeParams', '$dialog', '$dialogAlert', '$dialogConfirm', 'actionTargetsSvc', 'yearsSvc', 'UtilService', 'planActionsSvc', 'spinnerService', 'growl'];
    function PlanActionCtrlFunction($q, $routeParams, $dialog, $dialogAlert, $dialogConfirm, actionTargetsSvc, yearsSvc, UtilService, planActionsSvc, spinnerService, growl) {
        var ctrl = this;
        spinnerService.show('spinner1');
        ctrl.actionid = parseInt($routeParams.id);
        ctrl.searchstatus = $routeParams.searchstatus;
        var promises = [];
        promises.push(planActionsSvc.getItemById(ctrl.actionid));
        promises.push(actionTargetsSvc.getAllItems(ctrl.actionid));
        promises.push(yearsSvc.getAllItems());
        $q
            .all(promises)
            .then(function (results) {
                ctrl.action = results[0];
                ctrl.actiontargets = results[1];
                ctrl.years = results[2];
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

    }
})();
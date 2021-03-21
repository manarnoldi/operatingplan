(function () {
    'use strict';

    angular
        .module('planaction', [])
        .controller('planactionCtrl', PlanActionCtrlFunction);

    PlanActionCtrlFunction.$inject = ['$q', '$routeParams', '$dialogAlert', 'actionTargetsSvc', 'planCategorySvc', 'plansSvc', 'planActionsSvc', 'spinnerService', 'growl'];
    function PlanActionCtrlFunction($q, $routeParams, $dialogAlert, actionTargetsSvc, planCategorySvc, plansSvc, planActionsSvc, spinnerService, growl) {
        var ctrl = this;
        spinnerService.show('spinner1');
        ctrl.actionid = $routeParams.id;
        var promises = [];
        promises.push(planActionsSvc.getItemById(ctrl.actionid));
        promises.push(actionTargetsSvc.getAllItems(ctrl.actionid));
        $q
            .all(promises)
            .then(function (results) {
                ctrl.action = results[0];
                ctrl.actiontargets = results[1];
            })
            .catch(function (error) {
                growl.error(error);
            })
            .finally(function () {
                spinnerService.closeAll();
            });
    }
})();
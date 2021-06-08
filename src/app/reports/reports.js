(function () {
    'use strict';

    angular
        .module('reports', [])
        .controller('reportsCtrl', ReportsCtrl);

    ReportsCtrl.$inject = ['$q', '$dialogConfirm', '$dialogAlert', '$route', '$routeParams', '$location', 'reportsSvc', 'spinnerService', 'UtilService', 'growl'];
    function ReportsCtrl($q, $dialogConfirm, $dialogAlert, $route, $routeParams, $location, reportsSvc, spinnerService, UtilService, growl) {
        var ctrl = this;
        ctrl.isAdmin = false;
        var promises = [];
        promises.push(reportsSvc.getAllItems());
        promises.push(settingsSvc.checkIfCurrentUserIsAdmin());

        $q
            .all(promises)
            .then(function (data) {
                ctrl.years = data[0];
                ctrl.isAdmin = data[1];

            })
            .catch(function (error) {
                growl.error(error);
            })
            .finally(function () {
                spinnerService.closeAll();
            });
    }
})();
(function () {
    'use strict';

    angular
        .module('accountable', [])
        .controller('accountableCtrl', AccountableCtrl);

    AccountableCtrl.$inject = ['$q', '$route', '$routeParams', 'accountableSvc', 'spinnerService', 'UtilService', 'growl'];
    function AccountableCtrl($q, $route, $routeParams, accountableSvc, spinnerService, UtilService, growl) {
        var ctrl = this;
        ctrl.accountable = {};
        ctrl.action = $route.current.$$route.param;
        ctrl.links = UtilService.getAppShortcutlinks(3);
        ctrl.accountableId = $routeParams.id;
        ctrl.hostWebUrl = accountableSvc.hostWebUrl;
        if (ctrl.action == 'list') {
            spinnerService.show('spinner1');
        }
        var promises = [];
        promises.push(accountableSvc.getAllItems());

        $q
            .all(promises)
            .then(function (data) {
                ctrl.accountable = data[0];
            })
            .catch(function (error) {
                growl.error(error);
            })
            .finally(function () {
                spinnerService.closeAll();
            });
    }
})();
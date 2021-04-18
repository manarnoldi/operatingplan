(function () {
    'use strict';

    angular
        .module('teams', [])
        .controller('teamsCtrl', TeamsCtrl);

    TeamsCtrl.$inject = ['$q', '$dialogConfirm', '$dialogAlert', '$route', '$routeParams', '$location', 'teamsSvc', 'spinnerService', 'UtilService', 'growl'];
    function TeamsCtrl($q, $dialogConfirm, $dialogAlert, $route, $routeParams, $location, teamsSvc, spinnerService, UtilService, growl) {
        var ctrl = this;
        ctrl.team = {};
        ctrl.action = $route.current.$$route.param;
        ctrl.links = UtilService.getAppShortcutlinks(4);
        ctrl.teamId = $routeParams.id;
        ctrl.hostWebUrl = teamsSvc.hostWebUrl;
        if (ctrl.action == 'list') {
            spinnerService.show('spinner1');
        }
        var promises = [];
        promises.push(teamsSvc.getAllItems());

        $q
            .all(promises)
            .then(function (data) {
                ctrl.teams = data[0];
                if (ctrl.teamId && ctrl.action == 'edit') {
                    ctrl.team = _.find(ctrl.teams, function (t) {
                        return t.id == ctrl.teamId;
                    });
                }
            })
            .catch(function (error) {
                growl.error(error);
            })
            .finally(function () {
                spinnerService.closeAll();
            });
    }
})();
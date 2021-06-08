(function () {
    'use strict';

    angular
        .module('services.reports', [])
        .service('reportsSvc', ReportsSvc);

    ReportsSvc.$inject = ['$q', 'ShptRestService'];
    function ReportsSvc($q, ShptRestService) {
        var svc = this;
        var listname = 'PlanActions';
        svc.userid = _spPageContextInfo.userId;
        svc.hostWebUrl = ShptRestService.hostWebUrl;

        svc.getGetYearlyReport = function () {
            var defer = $q.defer();
            var queryParams = "$select=Id,Title,TeamLead/Id,TeamLead/Title&$expand=TeamLead";
            ShptRestService
                .getListItems(listname, queryParams)
                .then(function (data) {
                    teamsList = [];
                    _.forEach(data.results, function (o) {
                        var team = {};
                        team.id = o.Id;
                        team.title = o.Title;
                        team.teamlead = _.isNil(o.TeamLead) ? "" : { id: o.TeamLead.Id, title: o.TeamLead.Title };
                        teamsList.push(team);
                    });
                    defer.resolve(_.orderBy(teamsList, ['title'], ['asc']));
                })
                .catch(function (error) {
                    console.log(error);
                    defer.reject(error);
                });
            return defer.promise;
        };
    }
})();
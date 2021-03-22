(function () {
    'use strict';

    angular
        .module('services.teams', [])
        .service('teamsSvc', TeamsSvc);

    TeamsSvc.$inject = ['$q', 'ShptRestService'];
    function TeamsSvc($q, ShptRestService) {
        var svc = this;
        var listname = 'PlanTeams';
        svc.userid = _spPageContextInfo.userId;
        var teamsList = null;
        svc.hostWebUrl = ShptRestService.hostWebUrl;

        svc.getAllItems = function () {
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

        svc.AddItem = function (team) {
            var defer = $q.defer();
            var itemExists = _.some(teamsList, ['title', team.title]);

            if (itemExists) {
                defer.reject("The item specified already exists in the system. Contact IT Service desk for support.");
            } else {

                var data = {
                    Title: team.title,
                    TeamLeadId: team.teamlead.id
                };

                ShptRestService
                    .createNewListItem(listname, data)
                    .then(function (response) {
                        team.id = response.ID;
                        teamsList.push(team);
                        defer.resolve(_.orderBy(teamsList, ['title'], ['asc']));
                    })
                    .catch(function (error) {
                        console.log(error);
                        defer.reject("An error occured while adding the item. Contact IT Service desk for support.");
                    });
            }
            return defer.promise;
        };

        svc.UpdateItem = function (team) {
            var deferEdit = $q.defer();
            var itemExists = _.some(teamsList, ['id', team.id]);

            if (!itemExists) {
                deferEdit.reject("The item to be edited does not exist. Contact IT Service desk for support.");
            } else {
                var data = {
                    Title: team.title,
                    TeamLeadId: team.teamlead.id
                };

                ShptRestService
                    .updateListItem(listname, team.id, data)
                    .then(function (response) {
                        _.forEach(teamsList, function (t) {
                            if (t.id == team.id) {
                                t.title = team.title;
                                t.teamlead = team.teamlead;
                            }
                        });
                        deferEdit.resolve(teamsList, ['id', team.id]);
                    })
                    .catch(function (error) {
                        console.log(error);
                        deferEdit.reject("An error occured while adding the item. Contact IT Service desk for support.");
                    });
            }
            return deferEdit.promise;
        };

        svc.DeleteItem = function (id) {
            var defer = $q.defer();
            if (id) {
                ShptRestService
                    .deleteListItem(listname, id)
                    .then(function () {
                        _.remove(teamsList, {
                            id: id
                        });
                        defer.resolve(_.orderBy(teamsList, ['title'], ['asc']));
                    })
                    .catch(function (error) {
                        console.log(error);
                        defer.reject("An error occured while deleting the item. Contact IT Service desk for support.");
                    });
            } else {
                defer.reject('Item to be deleted is missing Id. Contact IT Service desk for support.');
            }
            return defer.promise;
        };
    }
})();
(function () {
    'use strict';

    angular
        .module('services.quarters', [])
        .service('quartersSvc', QuartersSvc);

    QuartersSvc.$inject = ['$q', 'ShptRestService'];
    function QuartersSvc($q, ShptRestService) {
        var svc = this;
        var listname = 'PlanQuarters';
        svc.userid = _spPageContextInfo.userId;
        var quartersList = null;
        svc.hostWebUrl = ShptRestService.hostWebUrl;

        svc.getAllItems = function () {
            var defer = $q.defer();
            var queryParams = "$select=Id,Title,Abbr";
            ShptRestService
                .getListItems(listname, queryParams)
                .then(function (data) {
                    quartersList = [];
                    _.forEach(data.results, function (q) {
                        var quarter = {};
                        quarter.id = q.Id;
                        quarter.title = q.Title;
                        quarter.abbr = q.Abbr;
                        quartersList.push(quarter);
                    });
                    defer.resolve(_.orderBy(quartersList, ['abbr'], ['desc']));
                })
                .catch(function (error) {
                    console.log(error);
                    defer.reject(error);
                });
            return defer.promise;
        };

        svc.AddItem = function (quarter) {
            var defer = $q.defer();
            var itemExists = _.some(quartersList, ['title', quarter.title]);

            if (itemExists) {
                defer.reject("The item specified already exists in the system. Contact IT Service desk for support.");
            } else {

                var data = {
                    Title: quarter.title,
                    Abbr: quarter.abbr
                };

                ShptRestService
                    .createNewListItem(listname, data)
                    .then(function (response) {
                        quarter.id = response.ID;
                        quartersList.push(quarter);
                        defer.resolve(_.orderBy(quartersList, ['abbr'], ['desc']));
                    })
                    .catch(function (error) {
                        console.log(error);
                        defer.reject("An error occured while adding the item. Contact IT Service desk for support.");
                    });
            }
            return defer.promise;
        };

        svc.UpdateItem = function (quarter) {
            var deferEdit = $q.defer();
            var itemExists = _.some(quartersList, ['id', quarter.id]);

            if (!itemExists) {
                deferEdit.reject("The item to be edited does not exist. Contact IT Service desk for support.");
            } else {
                var data = {
                    Title: quarter.title,
                    Abbr: quarter.abbr
                };

                ShptRestService
                    .updateListItem(listname, quarter.id, data)
                    .then(function (response) {
                        deferEdit.resolve(true);
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
                        _.remove(quartersList, {
                            id: id
                        });
                        defer.resolve(_.orderBy(quartersList, ['abbr'], ['desc']));
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
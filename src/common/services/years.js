(function () {
    'use strict';

    angular
        .module('services.years', [])
        .service('yearsSvc', YearsSvc);

    YearsSvc.$inject = ['$q', 'ShptRestService'];
    function YearsSvc($q, ShptRestService) {
        var svc = this;
        var listname = 'PlanYears';
        svc.userid = _spPageContextInfo.userId;
        var yearsList = null;
        svc.hostWebUrl = ShptRestService.hostWebUrl;

        svc.getAllItems = function () {
            var defer = $q.defer();
            var queryParams = "$select=Id,Title,StartDate,EndDate";
            ShptRestService
                .getListItems(listname, queryParams)
                .then(function (data) {
                    yearsList = [];
                    _.forEach(data.results, function (o) {
                        var year = {};
                        year.id = o.Id;
                        year.title = o.Title;
                        year.startdate = new Date(o.StartDate);
                        year.enddate = new Date(o.EndDate);
                        yearsList.push(year);
                    });
                    defer.resolve(yearsList);
                })
                .catch(function (error) {
                    console.log(error);
                    defer.reject(error);
                });
            return defer.promise;
        };

        svc.AddItem = function (year) {
            var defer = $q.defer();
            var itemExists = _.some(yearsList, ['title', year.title]);

            if (itemExists) {
                defer.reject("The item specified already exists in the system. Contact IT Service desk for support.");
            } else {

                var data = {
                    Title: year.title,
                    StartDate: year.startdate,
                    EndDate: year.enddate,
                };

                ShptRestService
                    .createNewListItem(listname, data)
                    .then(function (response) {
                        year.id = response.ID;
                        yearsList.push(year);
                        defer.resolve(_.orderBy(yearsList, ['title'], ['asc']));
                    })
                    .catch(function (error) {
                        console.log(error);
                        defer.reject("An error occured while adding the item. Contact IT Service desk for support.");
                    });
            }
            return defer.promise;
        };

        svc.UpdateItem = function (year) {
            var deferEdit = $q.defer();
            var itemExists = _.some(yearsList, ['id', year.id]);

            if (!itemExists) {
                deferEdit.reject("The item to be edited does not exist. Contact IT Service desk for support.");
            } else {
                var data = {
                    Title: year.title,
                    StartDate: year.startdate,
                    EndDate: year.enddate,
                };

                ShptRestService
                    .updateListItem(listname, year.id, data)
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
                        _.remove(yearsList, {
                            id: id
                        });
                        defer.resolve(_.orderBy(yearsList, ['title'], ['asc']));
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
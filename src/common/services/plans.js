(function () {
    'use strict';

    angular
        .module('services.plans', [])
        .service('plansSvc', PlansSvc);

    PlansSvc.$inject = ['$q', 'ShptRestService'];
    function PlansSvc($q, ShptRestService) {
        var svc = this;
        var listname = 'Plans';
        svc.userid = _spPageContextInfo.userId;
        var plansList = null;
        svc.hostWebUrl = ShptRestService.hostWebUrl;

        svc.getAllItems = function () {
            var defer = $q.defer();
            var queryParams = "$select=Id,Title,Description,StartDate,EndDate,YearsSpan";
            ShptRestService
                .getListItems(listname, queryParams)
                .then(function (data) {
                    plansList = [];
                    _.forEach(data.results, function (o) {
                        var plan = {};
                        plan.id = o.Id;
                        plan.title = o.Title;
                        plan.description = o.Description;
                        plan.startdate = new Date(o.StartDate);
                        plan.enddate = new Date(o.EndDate);
                        plan.yearsspan = o.YearsSpan;
                        plansList.push(plan);
                    });
                    defer.resolve(plansList);
                })
                .catch(function (error) {
                    console.log(error);
                    defer.reject(error);
                });
            return defer.promise;
        };

        svc.AddItem = function (plan) {
            var defer = $q.defer();
            var itemExists = _.some(plansList, ['title', plan.title]);

            if (itemExists) {
                defer.reject("The item specified already exists in the system. Contact IT Service desk for support.");
            } else {

                var data = {
                    Title: plan.title,
                    Description: plan.description,
                    StartDate: plan.startdate,
                    EndDate: plan.enddate,
                    YearsSpan: plan.yearsspan
                };

                ShptRestService
                    .createNewListItem(listname, data)
                    .then(function (response) {
                        plan.id = response.ID;
                        plansList.push(plan);
                        defer.resolve(_.orderBy(plansList, ['title'], ['asc']));
                    })
                    .catch(function (error) {
                        console.log(error);
                        defer.reject("An error occured while adding the item. Contact IT Service desk for support.");
                    });
            }
            return defer.promise;
        };

        svc.UpdateItem = function (plan) {
            var deferEdit = $q.defer();
            var itemExists = _.some(plansList, ['id', plan.id]);

            if (!itemExists) {
                deferEdit.reject("The item to be edited does not exist. Contact IT Service desk for support.");
            } else {
                var data = {
                    Title: plan.title,
                    Description: plan.description,
                    StartDate: plan.startdate,
                    EndDate: plan.enddate,
                    YearsSpan: plan.yearsspan
                };

                ShptRestService
                    .updateListItem(listname, plan.id, data)
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
                        _.remove(plansList, {
                            id: id
                        });
                        defer.resolve(_.orderBy(plansList, ['title'], ['asc']));
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
(function () {
    'use strict';

    angular
        .module('services.plancategories', [])
        .service('planCategorySvc', PlanCategorySvc);

    PlanCategorySvc.$inject = ['$q', 'ShptRestService'];
    function PlanCategorySvc($q, ShptRestService) {
        var svc = this;
        var listname = 'PlanCategories';
        svc.userid = _spPageContextInfo.userId;
        var planCategoriesList = null;
        svc.hostWebUrl = ShptRestService.hostWebUrl;

        svc.getAllItems = function () {
            var defer = $q.defer();
            var queryParams = "$select=Id,Title,CategoryNo,Code,Abbr";
            ShptRestService
                .getListItems(listname, queryParams)
                .then(function (data) {
                    planCategoriesList = [];
                    _.forEach(data.results, function (o) {
                        var plancat = {};
                        plancat.id = o.Id;
                        plancat.title = o.Title;
                        plancat.code = o.Code;
                        plancat.abbr = o.Abbr;
                        plancat.categoryno = o.CategoryNo;
                        planCategoriesList.push(plancat);
                    });
                    defer.resolve(planCategoriesList);
                })
                .catch(function (error) {
                    console.log(error);
                    defer.reject(error);
                });
            return defer.promise;
        };

        svc.AddItem = function (plancat) {
            var defer = $q.defer();
            var itemExists = _.some(planCategoriesList, ['title', plancat.title]);

            if (itemExists) {
                defer.reject("The item specified already exists in the system. Contact IT Service desk for support.");
            } else {

                var data = {
                    Title: plancat.title,
                    CategoryNo: plancat.categoryno,
                    Code: plancat.code,
                    Abbr: plancat.abbr
                };

                ShptRestService
                    .createNewListItem(listname, data)
                    .then(function (response) {
                        plancat.id = response.ID;
                        planCategoriesList.push(plancat);
                        defer.resolve(_.orderBy(planCategoriesList, ['title'], ['asc']));
                    })
                    .catch(function (error) {
                        console.log(error);
                        defer.reject("An error occured while adding the item. Contact IT Service desk for support.");
                    });
            }
            return defer.promise;
        };

        svc.UpdateItem = function (plancat) {
            var deferEdit = $q.defer();
            var itemExists = _.some(planCategoriesList, ['id', plancat.id]);

            if (!itemExists) {
                deferEdit.reject("The item to be edited does not exist. Contact IT Service desk for support.");
            } else {
                var data = {
                    Title: plancat.title,
                    CategoryNo: plancat.categoryno,
                    Code: plancat.code,
                    Abbr: plancat.abbr
                };

                ShptRestService
                    .updateListItem(listname, plancat.id, data)
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
                        _.remove(planCategoriesList, {
                            id: id
                        });
                        defer.resolve(_.orderBy(planCategoriesList, ['title'], ['asc']));
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
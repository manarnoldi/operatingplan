(function () {
    'use strict';

    angular
        .module('services.actiontargets', [])
        .service('actionTargetsSvc', ActionTargetsSvc);

    ActionTargetsSvc.$inject = ['$q', 'ShptRestService'];
    function ActionTargetsSvc($q, ShptRestService) {
        var svc = this;
        var listname = 'PlanActionYearTargets';
        svc.userid = _spPageContextInfo.userId;
        var actionTargetsList = null;
        svc.hostWebUrl = ShptRestService.hostWebUrl;

        svc.getAllItems = function (actionid) {
            var defer = $q.defer();
            var queryParams = "$select=Id,Title,PlanAction/Id,PlanAction/Title,AnnualTarget,TargetYear/Id,TargetYear/Title,Editor/Id,Editor/Title&"+
            "$expand=PlanAction,TargetYear,Editor&$filter=PlanAction/Id eq " + actionid;
            ShptRestService
                .getListItems(listname, queryParams)
                .then(function (data) {
                    actionTargetsList = [];
                    _.forEach(data.results, function (o) {
                        var target = {};
                        target.id = o.Id;
                        target.title = o.Title;
                        target.action = _.isNil(o.PlanAction) ? "" : { id: o.PlanAction.Id, title: o.PlanAction.Title };
                        target.target = o.AnnualTarget;
                        target.year = _.isNil(o.TargetYear) ? "" : { id: o.TargetYear.Id, title: o.TargetYear.Title };
                        target.updateby = new Date(o.Modified);
                        target.updatedate = _.isNil(o.Editor) ? '' : { id: o.Editor.Id, title: o.Editor.Title };
                        actionTargetsList.push(target);
                    });
                    defer.resolve(actionTargetsList);
                })
                .catch(function (error) {
                    console.log(error);
                    defer.reject(error);
                });
            return defer.promise;
        };

        //svc.AddItem = function (planaction) {
        //    var defer = $q.defer();
        //    var itemExists = _.some(planActionsList, function (p) {
        //        return p.actionname == planaction.actionname && p.plan.id == planaction.plan.id;
        //    });

        //    if (itemExists) {
        //        defer.reject("The item specified already exists in the system. Contact IT Service desk for support.");
        //    } else {

        //        var data = {
        //            Title: planaction.actionno + ".",
        //            PlanId: planaction.plan.id,
        //            ActionNo: planaction.actionno,
        //            ActionName: planaction.actionname,
        //            Accountable: planaction.accountable,
        //            Indicators: planaction.indicators,
        //            Status: planaction.status,
        //            PlanCategoryId: planaction.category.id
        //        };

        //        ShptRestService
        //            .createNewListItem(listname, data)
        //            .then(function (response) {
        //                planaction.id = response.ID;
        //                planActionsList.push(planaction);
        //                defer.resolve(_.orderBy(planActionsList, ['actionno'], ['asc']));
        //            })
        //            .catch(function (error) {
        //                console.log(error);
        //                defer.reject("An error occured while adding the item. Contact IT Service desk for support.");
        //            });
        //    }
        //    return defer.promise;
        //};

        //svc.UpdateItem = function (planaction) {
        //    var deferEdit = $q.defer();
        //    var itemExists = _.some(planActionsList, ['id', planaction.id]);
        //    if (!itemExists) {
        //        deferEdit.reject("The item to be edited does not exist. Contact IT Service desk for support.");
        //    } else {
        //        var data = {
        //            Title: planaction.title,
        //            PlanId: planaction.plan.id,
        //            ActionNo: planaction.actionno,
        //            ActionName: planaction.actionname,
        //            Accountable: planaction.accountable,
        //            Indicators: planaction.indicators,
        //            Status: planaction.status,
        //            PlanCategoryId: planaction.category.id
        //        };

        //        ShptRestService
        //            .updateListItem(listname, planaction.id, data)
        //            .then(function (response) {
        //                deferEdit.resolve(true);
        //            })
        //            .catch(function (error) {
        //                console.log(error);
        //                deferEdit.reject("An error occured while adding the item. Contact IT Service desk for support.");
        //            });
        //    }
        //    return deferEdit.promise;
        //};

        //svc.DeleteItem = function (id) {
        //    var defer = $q.defer();
        //    if (id) {
        //        ShptRestService
        //            .deleteListItem(listname, id)
        //            .then(function () {
        //                _.remove(planActionsList, {
        //                    id: id
        //                });
        //                defer.resolve(_.orderBy(planActionsList, ['actionno'], ['asc']));
        //            })
        //            .catch(function (error) {
        //                console.log(error);
        //                defer.reject("An error occured while deleting the item. Contact IT Service desk for support.");
        //            });
        //    } else {
        //        defer.reject('Item to be deleted is missing Id. Contact IT Service desk for support.');
        //    }
        //    return defer.promise;
        //};
    }
})();
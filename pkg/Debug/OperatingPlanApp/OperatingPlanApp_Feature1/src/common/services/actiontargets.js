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
        svc.usertitle = _spPageContextInfo.userDisplayName;
        var actionTargetsList = null;
        svc.hostWebUrl = ShptRestService.hostWebUrl;

        svc.getAllItems = function (actionid, yearid) {
            var defer = $q.defer();
            var queryParams = "";

            if (yearid) {
                queryParams = "$select=Id,Title,PlanAction/Id,PlanAction/Title,AnnualTarget,TargetYear/Id,TargetYear/Title,YearReview,RAGRating,Editor/Id,Editor/Title,Modified&" +
                    "$expand=PlanAction,TargetYear,Editor&$filter=PlanAction/Id eq " + actionid + " and TargetYear/Id eq " + yearid;
            } else {
                queryParams = "$select=Id,Title,PlanAction/Id,PlanAction/Title,AnnualTarget,TargetYear/Id,TargetYear/Title,YearReview,RAGRating,Editor/Id,Editor/Title,Modified&" +
                    "$expand=PlanAction,TargetYear,Editor&$filter=PlanAction/Id eq " + actionid;
            }

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
                        target.updatedate = new Date(o.Modified);
                        target.updateby = _.isNil(o.Editor) ? '' : { id: o.Editor.Id, title: o.Editor.Title };
                        target.review = o.YearReview;
                        target.ragrating = o.RAGRating;
                        actionTargetsList.push(target);
                    });
                    defer.resolve(_.orderBy(actionTargetsList, ['year.title'], ['desc']));
                })
                .catch(function (error) {
                    console.log(error);
                    defer.reject(error);
                });
            return defer.promise;
        };

        svc.AddItem = function (target) {
            var defer = $q.defer();
            var itemExists = _.some(actionTargetsList, function (p) {
                return target.actionid == p.action.id && target.year.id == p.year.id;
            });

            if (itemExists) {
                defer.reject("The target action for the year is already submitted, kindly click update on the list to do an update. Contact IT Service desk for support.");
            } else {

                var data = {
                    Title: target.actionno + "-" + target.year.title + " Target",
                    PlanActionId: target.actionid,
                    AnnualTarget: target.target,
                    TargetYearId: target.year.id
                };

                ShptRestService
                    .createNewListItem(listname, data)
                    .then(function (response) {
                        target.id = response.ID;
                        target.updatedate = response.Created;
                        target.updateby = { id: svc.userid, title: svc.usertitle };
                        actionTargetsList.push(target);
                        defer.resolve(_.orderBy(actionTargetsList, ['year.title'], ['desc']));
                    })
                    .catch(function (error) {
                        console.log(error);
                        defer.reject("An error occured while adding the item. Contact IT Service desk for support.");
                    });
            }
            return defer.promise;
        };

        svc.UpdateItem = function (target) {
            var deferEdit = $q.defer();
            var itemExists = _.some(actionTargetsList, ['id', target.id]);
            if (!itemExists) {
                deferEdit.reject("The item to be edited does not exist. Contact IT Service desk for support.");
            } else {
                var data = {
                    Title: target.title,
                    PlanActionId: target.actionid,
                    AnnualTarget: target.target,
                    TargetYearId: target.year.id,
                    YearReview: target.review,
                    RAGRating: target.ragrating
                };

                ShptRestService
                    .updateListItem(listname, target.id, data)
                    .then(function (response) {
                        var actdata = {
                            RAGRating: target.ragrating
                        };

                        ShptRestService
                            .updateListItem("PlanActions", target.actionid, actdata)
                            .then(function (pactions) {
                                _.forEach(actionTargetsList, function (t) {
                                    if (t.id == target.id) {
                                        t.target = target.target;
                                        t.review = target.review;
                                        t.ragrating = target.ragrating;
                                        t.updatedate = new Date();
                                        t.updateby = { id: svc.userid, title: svc.usertitle };
                                    }
                            })
                            .catch(function (error) {
                                console.log(error);
                                deferEdit.reject("An error occured while updating RAGRating value of the deliverable. Contact IT Service desk for support.");
                            });                        
                        });
                        deferEdit.resolve(_.orderBy(actionTargetsList, ['year.title'], ['desc']));
                    })
                    .catch(function (error) {
                        console.log(error);
                        deferEdit.reject("An error occured while adding the item. Contact IT Service desk for support.");
                    });
            }
            return deferEdit.promise;
        };

        svc.DeleteItem = function (id) {
            var deferDelete = $q.defer();
            if (id) {
                ShptRestService
                    .deleteListItem(listname, id)
                    .then(function () {
                        _.remove(actionTargetsList, {
                            id: id
                        });
                        deferDelete.resolve(_.orderBy(actionTargetsList, ['year.title'], ['desc']));
                    })
                    .catch(function (error) {
                        console.log(error);
                        deferDelete.reject("An error occured while deleting the item. Contact IT Service desk for support.");
                    });
            } else {
                deferDelete.reject('Item to be deleted is missing Id. Contact IT Service desk for support.');
            }
            return deferDelete.promise;
        };

    }
})();
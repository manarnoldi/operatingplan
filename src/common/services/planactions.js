(function () {
    'use strict';

    angular
        .module('services.planactions', [])
        .service('planActionsSvc', PlanActionsSvc);

    PlanActionsSvc.$inject = ['$q', 'ShptRestService'];
    function PlanActionsSvc($q, ShptRestService) {
        var svc = this;
        var listname = 'PlanActions';
        svc.userid = _spPageContextInfo.userId;
        var planActionsList = null;
        svc.hostWebUrl = ShptRestService.hostWebUrl;

        svc.getAllItems = function (planid) {
            var defer = $q.defer();
            var queryParams = "$select=Id,Title,Plan/Id,Plan/Title,ActionNo,ActionName,Accountable/Id,Accountable/Title,Indicators,Status,PlanCategory/Id,PlanCategory/Title," +
                "PlanCategory/Code,PlanCategory/Abbr,RAGRating&$expand=PlanCategory,Plan,Accountable&$filter=Plan/Id eq " + planid;
            ShptRestService
                .getListItems(listname, queryParams)
                .then(function (data) {
                    planActionsList = [];
                    _.forEach(data.results, function (o) {
                        var planaction = {};
                        planaction.id = o.Id;
                        planaction.title = o.Title;
                        planaction.plan = _.isNil(o.Plan) ? "" : { id: o.Plan.Id, title: o.Plan.Title };
                        planaction.actionno = o.ActionNo;
                        planaction.actionname = o.ActionName;
                        planaction.accountable = _.isNil(o.Accountable) ? "" : { id: o.Accountable.Id, title: o.Accountable.Title };
                        planaction.indicators = o.Indicators;
                        planaction.status = o.Status;
                        planaction.ragrating = o.RAGRating;
                        planaction.category = _.isNil(o.PlanCategory) ? "" : { id: o.PlanCategory.Id, title: o.PlanCategory.Title, code: o.PlanCategory.Code, abbr: o.PlanCategory.Abbr };
                        planActionsList.push(planaction);
                    });
                    defer.resolve(_.orderBy(planActionsList, ['actionno'], ['asc']));
                })
                .catch(function (error) {
                    console.log(error);
                    defer.reject(error);
                });
            return defer.promise;
        };

        svc.AddItem = function (planaction) {
            var defer = $q.defer();
            var itemExists = _.some(planActionsList, function (p) {
                return p.actionname == planaction.actionname && p.plan.id == planaction.plan.id;
            });

            if (itemExists) {
                defer.reject("The item specified already exists in the system. Contact IT Service desk for support.");
            } else {

                var data = {
                    Title: planaction.actionno + ".",
                    PlanId: planaction.plan.id,
                    ActionNo: planaction.actionno,
                    ActionName: planaction.actionname,
                    AccountableId: planaction.accountable.id,
                    Indicators: planaction.indicators,
                    Status: planaction.status,
                    PlanCategoryId: planaction.category.id,
                    RAGRating: 'Green'
                };

                ShptRestService
                    .createNewListItem(listname, data)
                    .then(function (response) {
                        defer.resolve(true);
                    })
                    .catch(function (error) {
                        console.log(error);
                        defer.reject("An error occured while adding the item. Contact IT Service desk for support.");
                    });
            }
            return defer.promise;
        };

        svc.updateRagRating = function (actionid, color) {
            var deferRagRating = $q.defer();
            var itemExists = _.some(planActionsList, ['id', actionid]);
            if (!itemExists) {
                deferRagRating.reject("The item to be edited does not exist. Contact IT Service desk for support.");
            } else {
                var data = {
                    RAGRating: color
                };

                ShptRestService
                    .updateListItem(listname, actionid, data)
                    .then(function (response) {
                        deferRagRating.resolve(true);
                    })
                    .catch(function (error) {
                        console.log(error);
                        deferRagRating.reject("An error occured while adding the item. Contact IT Service desk for support.");
                    });
            }
            return deferRagRating.promise;
        };

        svc.UpdateItem = function (planaction) {
            var deferEdit = $q.defer();
            var itemExists = _.some(planActionsList, ['id', planaction.id]);
            if (!itemExists) {
                deferEdit.reject("The item to be edited does not exist. Contact IT Service desk for support.");
            } else {
                var data = {
                    Title: planaction.title,
                    PlanId: planaction.plan.id,
                    ActionNo: planaction.actionno,
                    ActionName: planaction.actionname,
                    AccountableId: planaction.accountable.id,
                    Indicators: planaction.indicators,
                    Status: planaction.status,
                    PlanCategoryId: planaction.category.id
                };

                ShptRestService
                    .updateListItem(listname, planaction.id, data)
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
                        _.remove(planActionsList, {
                            id: id
                        });
                        defer.resolve(_.orderBy(planActionsList, ['actionno'], ['asc']));
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

        svc.getPlansSearched = function (planid, status) {
            var deferAction = $q.defer();
            if (!planid) {
                deferAction.reject("No active plan has been set.");
            } else {
            svc
                .getAllItems(planid)
                .then(function (planactions) {
                    if (!status) {
                        deferAction.resolve(planactions);
                    }
                    else if (status) {
                        deferAction.resolve(_.filter(planactions, function (p) {
                            return p.status == status;
                        }));
                    } 
                })
                .catch(function (error) {
                    deferAction.reject(error);
                    console.log(error);
                });
            }
            return deferAction.promise;
        };

        svc.getItemById = function (planid) {
            var deferItemById = $q.defer();
            var queryParams = "$select=Id,Title,Plan/Id,Plan/Title,ActionNo,ActionName,Accountable/Id,Accountable/Title,Indicators,Status,PlanCategory/Id,PlanCategory/Title," +
                "PlanCategory/Code,PlanCategory/Abbr,RAGRating&$expand=PlanCategory,Plan,Accountable";
            ShptRestService
                .getListItemById(listname, planid, queryParams)
                .then(function (res) {
                    var planaction = {};
                    planaction.id = res.Id;
                    planaction.title = res.Title;
                    planaction.plan = _.isNil(res.Plan) ? "" : { id: res.Plan.Id, title: res.Plan.Title };
                    planaction.actionno = res.ActionNo;
                    planaction.actionname = res.ActionName;
                    planaction.accountable = _.isNil(res.Accountable) ? "" : { id: res.Accountable.Id, title: res.Accountable.Title };
                    planaction.indicators = res.Indicators;
                    planaction.status = res.Status;
                    planaction.ragrating = res.RAGRating;
                    planaction.category = _.isNil(res.PlanCategory) ? "" : { id: res.PlanCategory.Id, title: res.PlanCategory.Title, code: res.PlanCategory.Code, abbr: res.PlanCategory.Abbr };
                    deferItemById.resolve(planaction);
                })
                .catch(function (error) {
                    console.log(error);
                    deferItemById.reject(error);
                });
            return deferItemById.promise;
        };
    }
})();
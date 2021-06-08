(function () {
    'use strict';

    angular
        .module('services.reports', [])
        .service('reportsSvc', ReportsSvc);

    ReportsSvc.$inject = ['$q', 'ShptRestService', 'actionTargetsSvc'];
    function ReportsSvc($q, ShptRestService, actionTargetsSvc) {
        var svc = this;
        var yearlyReportList = [];
        svc.userid = _spPageContextInfo.userId;
        svc.hostWebUrl = ShptRestService.hostWebUrl;

        svc.getGetYearlyReport = function (plan, year) {
            var defer = $q.defer();
            var queryParams = "$select=Id,Title,Plan/Id,Plan/Title,ActionNo,ActionName,Accountable/Id,Accountable/Title,Indicators,Status,PlanCategory/Id,PlanCategory/Title," +
                "PlanCategory/Code,PlanCategory/Abbr,RAGRating&$expand=PlanCategory,Plan,Accountable&$filter=Plan/Id eq " + plan.id;
            ShptRestService
                .getListItems("PlanActions", queryParams)
                .then(function (data) {
                    var targetProms = [];
                    _.forEach(data.results, function (o) {
                        var pa = {};
                        pa.id = o.Id;
                        pa.title = o.Title;
                        pa.plan = _.isNil(o.Plan) ? "" : { id: o.Plan.Id, title: o.Plan.Title };
                        pa.actionno = o.ActionNo;
                        pa.actionname = o.ActionName;
                        pa.accountable = _.isNil(o.Accountable) ? "" : { id: o.Accountable.Id, title: o.Accountable.Title };
                        pa.indicators = o.Indicators;
                        pa.status = o.Status;
                        pa.ragrating = o.RAGRating;
                        pa.category = _.isNil(o.PlanCategory) ? "" : { id: o.PlanCategory.Id, title: o.PlanCategory.Title, code: o.PlanCategory.Code, abbr: o.PlanCategory.Abbr };
                        pa.target = "";
                        pa.year = "";
                        pa.ragrating = "";
                        pa.review = "";
                        targetProms.push(actionTargetsSvc.getAllItems(pa.id, year.id));
                        yearlyReportList.push(pa);
                    });

                    $q
                        .all(targetProms)
                        .then(function (targetRes) {
                            for (var i = 0; i < targetRes.length; i++) {
                                yearlyReportList[i].target = targetRes[i] ? targetRes[i].target : "";
                                yearlyReportList[i].year = targetRes[i] ? targetRes[i].year : "";
                                yearlyReportList[i].ragrating = targetRes[i] ? targetRes[i].ragrating : "";
                                yearlyReportList[i].review = targetRes[i] ? targetRes[i].review : "";
                            }
                            defer.resolve(_.orderBy(yearlyReportList, ['title'], ['asc']));
                        })
                        .catch(function (error) {
                            console.log(error);
                            defer.reject(error);
                        });                    
                })
                .catch(function (error) {
                    console.log(error);
                    defer.reject(error);
                });
            return defer.promise;
        };

        svc.getGetQuarterlyReport = function (plan, year, quarter) {
            var defer = $q.defer();
            var queryParams = "$select=Id,Title,Plan/Id,Plan/Title,ActionNo,ActionName,Accountable/Id,Accountable/Title,Indicators,Status,PlanCategory/Id,PlanCategory/Title," +
                "PlanCategory/Code,PlanCategory/Abbr,RAGRating&$expand=PlanCategory,Plan,Accountable&$filter=Plan/Id eq " + plan.id;
            ShptRestService
                .getListItems("PlanActions", queryParams)
                .then(function (data) {
                    var targetProms = [];
                    _.forEach(data.results, function (o) {
                        var pa = {};
                        pa.id = o.Id;
                        pa.title = o.Title;
                        pa.plan = _.isNil(o.Plan) ? "" : { id: o.Plan.Id, title: o.Plan.Title };
                        pa.actionno = o.ActionNo;
                        pa.actionname = o.ActionName;
                        pa.accountable = _.isNil(o.Accountable) ? "" : { id: o.Accountable.Id, title: o.Accountable.Title };
                        pa.indicators = o.Indicators;
                        pa.status = o.Status;
                        pa.ragrating = o.RAGRating;
                        pa.category = _.isNil(o.PlanCategory) ? "" : { id: o.PlanCategory.Id, title: o.PlanCategory.Title, code: o.PlanCategory.Code, abbr: o.PlanCategory.Abbr };
                        pa.target = "";
                        pa.year = "";
                        pa.ragrating = "";
                        pa.review = "";
                        targetProms.push(actionTargetsSvc.getAllItems(pa.id, year.id));
                        yearlyReportList.push(pa);
                    });

                    $q
                        .all(targetProms)
                        .then(function (targetRes) {
                            for (var i = 0; i < targetRes.length; i++) {
                                yearlyReportList[i].target = targetRes[i] ? targetRes[i].target : "";
                                yearlyReportList[i].year = targetRes[i] ? targetRes[i].year : "";
                                yearlyReportList[i].ragrating = targetRes[i] ? targetRes[i].ragrating : "";
                                yearlyReportList[i].review = targetRes[i] ? targetRes[i].review : "";
                            }
                            defer.resolve(_.orderBy(yearlyReportList, ['title'], ['asc']));
                        })
                        .catch(function (error) {
                            console.log(error);
                            defer.reject(error);
                        });
                })
                .catch(function (error) {
                    console.log(error);
                    defer.reject(error);
                });
            return defer.promise;
        };
    }
})();
(function () {
    'use strict';

    angular
        .module('services.reports', [])
        .service('reportsSvc', ReportsSvc);

    ReportsSvc.$inject = ['$q', 'ShptRestService', 'actionTargetsSvc', 'qReviewsSvc'];
    function ReportsSvc($q, ShptRestService, actionTargetsSvc, qReviewsSvc) {
        var svc = this;
        var yearlyReportList = null;
        svc.userid = _spPageContextInfo.userId;
        svc.hostWebUrl = ShptRestService.hostWebUrl;

        svc.getYearlyReport = function (plan, year) {
            var defer = $q.defer();
            var queryParams = "$select=Id,Title,Plan/Id,Plan/Title,ActionNo,ActionName,Accountable/Id,Accountable/Title,Indicators,Status,PlanCategory/Id,PlanCategory/Title," +
                "PlanCategory/Code,PlanCategory/Abbr,PlanCategory/CategoryNo,RAGRating&$expand=PlanCategory,Plan,Accountable&$filter=Plan/Id eq " + plan.id;
            ShptRestService
                .getListItems("PlanActions", queryParams)
                .then(function (data) {
                    yearlyReportList = [];
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
                        pa.category = _.isNil(o.PlanCategory) ? "" : { id: o.PlanCategory.Id, title: o.PlanCategory.Title, code: o.PlanCategory.Code, abbr: o.PlanCategory.Abbr, categoryno: o.PlanCategory.CategoryNo };
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
                                yearlyReportList[i].target = targetRes[i].length > 0 ? targetRes[i][0].target : "";
                                yearlyReportList[i].year = targetRes[i].length > 0 ? targetRes[i][0].year : "";
                                yearlyReportList[i].ragrating = targetRes[i].length > 0 ? targetRes[i][0].ragrating : "";
                                yearlyReportList[i].review = targetRes[i].length > 0 ? targetRes[i][0].review : "";
                            }
                            defer.resolve(_.orderBy(yearlyReportList, ['actionno'], ['asc']));
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

        svc.getQuarterlyReport = function (plan, year, quarter) {
            var quarterlyReportList = null;
            var defer = $q.defer();
            var queryParams = "$select=Id,Title,Plan/Id,Plan/Title,ActionNo,ActionName,Accountable/Id,Accountable/Title,Indicators,Status,PlanCategory/Id,PlanCategory/Title," +
                "PlanCategory/Code,PlanCategory/Abbr,PlanCategory/CategoryNo,RAGRating&$expand=PlanCategory,Plan,Accountable&$filter=Plan/Id eq " + plan.id;
            ShptRestService
                .getListItems("PlanActions", queryParams)
                .then(function (data) {
                    quarterlyReportList = [];
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
                        pa.category = _.isNil(o.PlanCategory) ? "" : { id: o.PlanCategory.Id, title: o.PlanCategory.Title, code: o.PlanCategory.Code, abbr: o.PlanCategory.Abbr, categoryno: o.PlanCategory.CategoryNo };
                        pa.target = "";
                        pa.quarter = "";
                        pa.ragrating = "";
                        pa.review = "";
                        targetProms.push(qReviewsSvc.getQuarterRating(pa.id, year.id, quarter.id));
                        quarterlyReportList.push(pa);
                    });

                    $q
                        .all(targetProms)
                        .then(function (targetRes) {
                            for (var i = 0; i < targetRes.length; i++) {
                                quarterlyReportList[i].target = targetRes[i].length > 0 ? targetRes[i][0].target : "";
                                quarterlyReportList[i].quarter = targetRes[i].length > 0 ? targetRes[i][0].quarter : "";
                                quarterlyReportList[i].ragrating = targetRes[i].length > 0 ? targetRes[i][0].ragrating : "";
                                quarterlyReportList[i].review = targetRes[i].length > 0 ? targetRes[i][0].review : "";
                            }
                            defer.resolve(_.orderBy(quarterlyReportList, ['actionno'], ['asc']));
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
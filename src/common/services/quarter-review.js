(function () {
    'use strict';

    angular
        .module('services.qreviews', [])
        .service('qReviewsSvc', QReviewsSvc);

    QReviewsSvc.$inject = ['$q', 'ShptRestService'];
    function QReviewsSvc($q, ShptRestService) {
        var svc = this;
        var listname = 'PlanActionsQuarterlyReview';
        svc.userid = _spPageContextInfo.userId;
        svc.usertitle = _spPageContextInfo.userDisplayName;
        var qreviewsList = null;
        svc.hostWebUrl = ShptRestService.hostWebUrl;

        svc.getAllItems = function (actiontargetid) {
            var deferQR = $q.defer();
            var queryParams = "$select=Id,Title,PlanQuarter/Id,PlanQuarter/Title,PlanQuarter/Abbr,PlanActionYearTarget/Id,PlanActionYearTarget/Title,Review,RAGRating,Modified,Editor/Id,Editor/Title&" +
                "$expand=PlanQuarter,PlanActionYearTarget,Editor&$filter=PlanActionYearTarget/Id eq " + actiontargetid;
            ShptRestService
                .getListItems(listname, queryParams)
                .then(function (data) {
                    qreviewsList = [];
                    _.forEach(data.results, function (qr) {
                        var qreview = {};
                        qreview.id = qr.Id;
                        qreview.title = qr.Title;
                        qreview.target = _.isNil(qr.PlanActionYearTarget) ? "" : { id: qr.PlanActionYearTarget.Id, title: qr.PlanActionYearTarget.Title };
                        qreview.quarter = _.isNil(qr.PlanQuarter) ? "" : { id: qr.PlanQuarter.Id, title: qr.PlanQuarter.Title, abbr: qr.PlanQuarter.Abbr };
                        qreview.review = qr.Review;
                        qreview.ragrating = qr.RAGRating;
                        qreview.updatedate = new Date(qr.Modified);
                        qreview.updateby = _.isNil(qr.Editor) ? '' : { id: qr.Editor.Id, title: qr.Editor.Title };
                        qreviewsList.push(qreview);
                    });
                    deferQR.resolve(_.orderBy(qreviewsList, ['quarter'], ['asc']));
                })
                .catch(function (error) {
                    console.log(error);
                    deferQR.reject(error);
                });
            return deferQR.promise;
        };

        svc.AddItem = function (review) {
            var defer = $q.defer();
            var itemExists = _.some(qreviewsList, function (r) {
                return r.quarter.id == review.quarter.id && r.target.id == review.target.id;
            });

            if (itemExists) {
                defer.reject("The item specified already exists in the system. Contact IT Service desk for support.");
            } else {

                var data = {
                    Title: review.target.title + " " + review.quarter.title,
                    PlanQuarterId: review.quarter.id,
                    Review: review.review,
                    PlanActionYearTargetId: review.target.id,
                    RAGRating: review.ragrating
                };

                ShptRestService
                    .createNewListItem(listname, data)
                    .then(function (response) {
                        review.id = response.ID;
                        review.updatedate = response.Created;
                        review.updateby = { id: svc.userid, title: svc.usertitle };
                        qreviewsList.push(review);
                        defer.resolve(_.orderBy(qreviewsList, ['quarter'], ['asc']));
                    })
                    .catch(function (error) {
                        console.log(error);
                        defer.reject("An error occured while adding the item. Contact IT Service desk for support.");
                    });
            }
            return defer.promise;
        };

        svc.UpdateItem = function (review) {
            var deferEdit = $q.defer();
            var itemExists = _.some(qreviewsList, ['id', review.id]);

            if (!itemExists) {
                deferEdit.reject("The item to be edited does not exist. Contact IT Service desk for support.");
            } else {
                var data = {
                    Title: review.target.title + " " + review.quarter.title,
                    PlanQuarterId: review.quarter.id,
                    Review: review.review,
                    PlanActionYearTargetId: review.target.id,
                    RAGRating: review.ragrating
                };

                ShptRestService
                    .updateListItem(listname, review.id, data)
                    .then(function (response) {
                        svc.
                            getAllItems(parseInt(review.target.id))
                            .then(function (reviews) {
                                qreviewsList = reviews;
                                deferEdit.resolve(_.orderBy(qreviewsList, ['quarter'], ['asc']));
                            })
                            .catch(function (error) {
                                console.log(error);
                                deferEdit.reject("An error occured while adding the item. Contact IT Service desk for support.");
                            });     
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
                        _.remove(qreviewsList, {
                            id: id
                        });
                        defer.resolve(_.orderBy(qreviewsList, ['quarter'], ['asc']));
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
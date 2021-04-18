(function () {
    'use strict';

    angular
        .module('services.outputprogress', [])
        .service('outputProgressSvc', OutputProgressSvc);

    OutputProgressSvc.$inject = ['$q', 'ShptRestService'];
    function OutputProgressSvc($q, ShptRestService) {
        var svc = this;
        var listname = 'PlanOutputProgress';
        svc.userid = _spPageContextInfo.userId;
        svc.usertitle = _spPageContextInfo.userDisplayName;
        var ProgressList = null;
        svc.hostWebUrl = ShptRestService.hostWebUrl;

        svc.getAllItems = function (outputid) {
            var defer = $q.defer();
            var queryParams = "$select=Id,Title,TargetOutput/Id,TargetOutput/Title,Quarter/Id,Quarter/Title,Quarter/Abbr,Notes,ProgressText,ProgressNo,Modified,Editor/Id,Editor/Title&" +
                "$expand=TargetOutput,Quarter,Editor&$filter=TargetOutput/Id eq " + outputid;
            ShptRestService
                .getListItems(listname, queryParams)
                .then(function (data) {
                    ProgressList = [];
                    _.forEach(data.results, function (p) {
                        var progress = {};
                        progress.id = p.Id;
                        progress.title = p.Title;
                        progress.output = _.isNil(p.TargetOutput) ? "" : { id: p.TargetOutput.Id, title: p.TargetOutput.Title };
                        progress.quarter = _.isNil(p.Quarter) ? "" : { id: p.Quarter.Id, title: p.Quarter.Title, abbr: p.Quarter.Abbr };
                        progress.notes = p.Notes;
                        progress.progresstext = p.ProgressText;
                        progress.progressno = p.ProgressNo;
                        progress.updatedate = new Date(p.Modified);
                        progress.updateby = _.isNil(p.Editor) ? '' : { id: p.Editor.Id, title: p.Editor.Title };
                        ProgressList.push(progress);
                    });
                    defer.resolve(_.orderBy(ProgressList, ['quarter'], ['desc']));
                })
                .catch(function (error) {
                    console.log(error);
                    defer.reject(error);
                });
            return defer.promise;
        };

        svc.getMaximumProgress = (outid) => {
            var deferMax = $q.defer();
            var qparams = "$select=TargetOutput/Id,TargetOutput/Title,ProgressNo&$expand=TargetOutput&$top=1&$orderby=ProgressNo desc&$filter=TargetOutput/Id eq " + outid;;
            ShptRestService
                .getListItemsWNT(listname, qparams)
                .then(function (d) {  
                    var returnVal = d.results.length <= 0 ? 0 : d.results[0].ProgressNo;
                    deferMax.resolve(returnVal);
                })
                .catch(function (error) {
                    console.log(error);
                    deferMax.reject(error);
                });
            return deferMax.promise;
        };

        svc.AddItem = function (progress) {
            var defer = $q.defer();
            var itemExists = _.some(ProgressList, function (p) {
                return progress.output.id == p.output.id && progress.quarter.id == p.quarter.id;
            });

            if (itemExists) {
                defer.reject("The progress for the output is already submitted, kindly click update on the list to do an update. Contact IT Service desk for support.");
            } else {
                var data = {
                    Title: progress.output.title + "-" + progress.quarter.abbr,
                    TargetOutputId: progress.output.id,
                    QuarterId: progress.quarter.id,
                    Notes: progress.notes,
                    ProgressText: progress.progresstext,
                    ProgressNo: progress.progressno
                };

                ShptRestService
                    .createNewListItem(listname, data)
                    .then(function (response) {
                        progress.id = response.ID;
                        progress.updatedate = response.Created;
                        progress.updateby = { id: svc.userid, title: svc.usertitle };
                        ProgressList.push(progress);
                        defer.resolve(_.orderBy(ProgressList, ['quarter'], ['desc']));
                    })
                    .catch(function (error) {
                        console.log(error);
                        defer.reject("An error occured while adding the item. Contact IT Service desk for support.");
                    });
            }
            return defer.promise;
        };

        svc.UpdateItem = function (progress) {
            var deferEdit = $q.defer();
            var itemExists = _.some(ProgressList, ['id', progress.id]);
            if (!itemExists) {
                deferEdit.reject("The item to be edited does not exist. Contact IT Service desk for support.");
            } else {

                var data = {
                    Title: progress.title,
                    TargetOutputId: progress.output.id,
                    QuarterId: progress.quarter.id,
                    Notes: progress.notes,
                    ProgressText: progress.progresstext,
                    ProgressNo: progress.progressno
                };

                ShptRestService
                    .updateListItem(listname, progress.id, data)
                    .then(function (response) {

                        svc.
                            getAllItems(parseInt(progress.output.id))
                            .then(function (outs) {
                                deferEdit.resolve(outs);
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
            var deferDelete = $q.defer();
            if (id) {
                ShptRestService
                    .deleteListItem(listname, id)
                    .then(function () {
                        _.remove(ProgressList, {
                            id: id
                        });
                        deferDelete.resolve(_.orderBy(ProgressList, ['quarter'], ['desc']));
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
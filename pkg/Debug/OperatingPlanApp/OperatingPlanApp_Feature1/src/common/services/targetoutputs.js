(function () {
    'use strict';

    angular
        .module('services.targetoutputs', [])
        .service('targetOutputsSvc', TargetOutputsSvc);

    TargetOutputsSvc.$inject = ['$q', 'ShptRestService', 'outputProgressSvc'];
    function TargetOutputsSvc($q, ShptRestService, outputProgressSvc) {
        var svc = this;
        var listname = 'PlanActionYearTargetOutputs';
        svc.userid = _spPageContextInfo.userId;
        svc.usertitle = _spPageContextInfo.userDisplayName;
        var OutputsList = null;
        svc.hostWebUrl = ShptRestService.hostWebUrl;

        svc.getAllItems = function (targetid) {
            var defer = $q.defer();            
            var queryParams = "$select=Id,Title,ActionYearTarget/Id,ActionYearTarget/Title,Output,LeadTeam/Id,LeadTeam/Title,IndividualResponsible/Id," +
                "IndividualResponsible/Title,OtherTeamsRequired/Id,OtherTeamsRequired/Title,Status,OutputNum,Modified,Editor/Id,Editor/Title&" +
                "$expand=ActionYearTarget,LeadTeam,IndividualResponsible,OtherTeamsRequired,Editor&$filter=ActionYearTarget/Id eq " + targetid;
            ShptRestService
                .getListItems(listname, queryParams)
                .then(function (data) {
                    OutputsList = [];
                    var progressProms = [];
                    _.forEach(data.results, function (o) {
                        var output = {};
                        output.id = o.Id;
                        output.title = o.Title;
                        output.target = _.isNil(o.ActionYearTarget) ? "" : { id: o.ActionYearTarget.Id, title: o.ActionYearTarget.Title };
                        output.output = o.Output;
                        output.leadteam = _.isNil(o.LeadTeam) ? "" : { id: o.LeadTeam.Id, title: o.LeadTeam.Title };
                        output.responsible = _.isNil(o.IndividualResponsible) ? "" : { id: o.IndividualResponsible.Id, title: o.IndividualResponsible.Title };
                        output.otherteams = [];
                        _.forEach(o.OtherTeamsRequired.results, function (team) {
                            output.otherteams.push({ id: team.Id, title: team.Title });
                        });
                        output.status = o.Status;
                        output.num = o.OutputNum;
                        output.updatedate = new Date(o.Modified);
                        output.updateby = _.isNil(o.Editor) ? '' : { id: o.Editor.Id, title: o.Editor.Title };                       
                        progressProms.push(outputProgressSvc.getMaximumProgress(o.Id))
                        output.progress = 0;
                        OutputsList.push(output);
                    });

                    $q
                        .all(progressProms)
                        .then(function (progRes) {
                            for (var i = 0; i < progRes.length; i++) {
                                OutputsList[i].progress = progRes[i];
                            }
                            defer.resolve(_.orderBy(OutputsList, ['num'], ['asc']));
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

        svc.AddItem = function (output) {
            var defer = $q.defer();
            var itemExists = _.some(OutputsList, function (o) {
                return output.target.id == o.target.id && output.output == o.output && output.leadteam.id == o.leadteam.id;
            });

            if (itemExists) {
                defer.reject("The output for the target for the lead team is already submitted, kindly click update on the list to do an update. Contact IT Service desk for support.");
            } else {
                ShptRestService
                    .ensureUser(output.individual[0].Login)
                    .then(function (ind) {
                        var idstosave = [];
                        _.forEach(output.otherteams, function (t) {
                            idstosave.push(t.id);
                        });
                        var data = {
                            Title: output.target.title + "-Output-" + output.num,
                            ActionYearTargetId: output.target.id,
                            Output: output.output,
                            LeadTeamId: output.leadteam.id,
                            IndividualResponsibleId: ind.Id,
                            OtherTeamsRequiredId: { "results": idstosave },
                            Status: output.status,
                            OutputNum: output.num
                        };

                        ShptRestService
                            .createNewListItem(listname, data)
                            .then(function (response) {
                                svc.
                                    getAllItems(parseInt(output.target.id))
                                    .then(function (outs) {
                                        defer.resolve(_.orderBy(outs, ['num'], ['asc']));
                                    })
                                    .catch(function (error) {
                                        console.log(error);
                                        defer.reject("An error occured while adding the item. Contact IT Service desk for support.");
                                    });
                            })
                            .catch(function (error) {
                                console.log(error);
                                defer.reject("An error occured while adding the item. Contact IT Service desk for support.");
                            });
                    })
                    .catch(function (error) {
                        console.log(error);
                        defer.reject("An error occured while adding the item. Contact IT Service desk for support.");
                    });
            }
            return defer.promise;
        };

        svc.UpdateItem = function (output) {
            var deferEdit = $q.defer();
            var itemExists = _.some(OutputsList, ['id', output.id]);
            if (!itemExists) {
                deferEdit.reject("The item to be edited does not exist. Contact IT Service desk for support.");
            } else {
                ShptRestService
                    .ensureUser(output.individual[0].Login)
                    .then(function (ind) {
                        var idstosave = [];
                        _.forEach(output.otherteams, function (t) {
                            idstosave.push(t.id);
                        });
                        var data = {
                            Title: output.title,
                            ActionYearTargetId: output.target.id,
                            Output: output.output,
                            LeadTeamId: output.leadteam.id,
                            IndividualResponsibleId: ind.Id,
                            OtherTeamsRequiredId: { "results": idstosave },
                            Status: output.status
                        };

                        ShptRestService
                            .updateListItem(listname, output.id, data)
                            .then(function (response) {
                                svc.
                                    getAllItems(parseInt(output.target.id))
                                    .then(function (outs) {
                                        defer.resolve(_.orderBy(outs, ['num'], ['asc']));
                                    })
                                    .catch(function (error) {
                                        console.log(error);
                                        defer.reject("An error occured while adding the item. Contact IT Service desk for support.");
                                    });
                            })
                            .catch(function (error) {
                                console.log(error);
                                deferEdit.reject("An error occured while adding the item. Contact IT Service desk for support.");
                            });
                    })
                    .catch(function (error) {
                        console.log(error);
                        defer.reject("An error occured while adding the item. Contact IT Service desk for support.");
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
                        _.remove(OutputsList, {
                            id: id
                        });
                        deferDelete.resolve(_.orderBy(OutputsList, ['num'], ['asc']));
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

        svc.getHighestNum = function (targetId) {
            var numvalue = _.maxBy(_.filter(OutputsList, ['target.id', targetId]), 'num');
            return numvalue ? numvalue.num + 1 : 1;
        };

        svc.removeRespIndividual = function (individualId, outputId) {
            var deferRemInd = $q.defer();
            if (individualId) {
                var data = {
                    IndividualResponsibleId: individualId
                };
                ShptRestService
                    .updateListItem(listname, outputId, data)
                    .then(function (res) {
                        deferRemInd.resolve(true);
                    })
                    .catch(function (error) {
                        console.log(error);
                        deferRemInd.reject("An error occured while adding the item. Contact IT Service desk for support.");
                    });
            } else {
                deferRemInd.reject('Item to be deleted is missing Id. Contact IT Service desk for support.');
            }
            return deferRemInd.promise;
        };
    }
})();
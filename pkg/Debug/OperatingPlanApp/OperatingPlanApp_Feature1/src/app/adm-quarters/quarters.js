(function () {
    'use strict';

    angular
        .module('quarters', [])
        .controller('quartersCtrl', QuartersCtrl);

    QuartersCtrl.$inject = ['$q', '$dialogConfirm', '$dialogAlert', '$route', '$routeParams', '$location', 'quartersSvc', 'spinnerService', 'UtilService', 'growl'];
    function QuartersCtrl($q, $dialogConfirm, $dialogAlert, $route, $routeParams, $location, quartersSvc, spinnerService, UtilService, growl) {
        var ctrl = this;
        ctrl.quarter = {};
        ctrl.action = $route.current.$$route.param;
        ctrl.links = UtilService.getAppShortcutlinks(2);
        ctrl.quarterId = $routeParams.id;
        ctrl.hostWebUrl = quartersSvc.hostWebUrl;
        if (ctrl.action == 'list') {
            spinnerService.show('spinner1');
        }
        var promises = [];
        promises.push(quartersSvc.getAllItems());

        $q
            .all(promises)
            .then(function (data) {
                ctrl.quarters = data[0];
                if (ctrl.quarterId && ctrl.action == 'edit') {
                    ctrl.quarter = _.find(ctrl.quarters, function (q) {
                        return q.id == ctrl.quarterId;
                    });
                }
            })
            .catch(function (error) {
                growl.error(error);
            })
            .finally(function () {
                spinnerService.closeAll();
            });

        ctrl.AddRecord = function () {
            if (!ctrl.quarter.title) {
                $dialogAlert("Kindly provide the quarter title.", "Missing Details");
                return;
            }

            $dialogConfirm(ctrl.action == "edit" ? "Update Record?" : "Add Record?", 'Confirm Transaction')
                .then(function () {
                    spinnerService.show('spinner1');
                    var updateProms = [];
                    if (ctrl.action == 'edit') {
                        updateProms.push(quartersSvc.UpdateItem(ctrl.quarter));
                    } else {
                        updateProms.push(quartersSvc.AddItem(ctrl.quarter));
                    }

                    $q
                        .all(updateProms)
                        .then(function (res) {
                            growl.success(ctrl.action == "edit" ? "Record updated successfully!" : "Record added successfully!");
                            $location.path("/listAdminQuarters");
                        })
                        .catch(function (error) {
                            growl.error(error);
                        })
                        .finally(function () {
                            spinnerService.closeAll();
                        });
                });
        };

        ctrl.DeleteRecord = function (id) {
            $dialogConfirm('Delete Record?', 'Confirm Transaction')
                .then(function () {
                    spinnerService.show('spinner1');
                    quartersSvc
                        .DeleteItem(id)
                        .then(function (res) {
                            ctrl.quarters = res;
                            growl.success("Record deleted successfully!");
                        })
                        .catch(function (error) {
                            growl.error(error);
                        })
                        .finally(function () {
                            spinnerService.closeAll();
                        })
                });
        };
    }
})();
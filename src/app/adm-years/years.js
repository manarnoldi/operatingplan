(function () {
    'use strict';

    angular
        .module('years', [])
        .controller('yearsCtrl', YearsCtrl);

    YearsCtrl.$inject = ['$q', '$dialogConfirm','$dialogAlert', '$route', '$routeParams', '$location', 'yearsSvc', 'spinnerService', 'UtilService', 'growl'];
    function YearsCtrl($q, $dialogConfirm, $dialogAlert, $route, $routeParams, $location, yearsSvc, spinnerService, UtilService, growl) {
        var ctrl = this;
        ctrl.year = {};
        ctrl.action = $route.current.$$route.param;
        ctrl.links = UtilService.getAppShortcutlinks(1);
        ctrl.yearId = $routeParams.id;
        ctrl.hostWebUrl = yearsSvc.hostWebUrl;
        if (ctrl.action == 'list') {
            spinnerService.show('spinner1');
        }
        var promises = [];
        promises.push(yearsSvc.getAllItems());

        $q
            .all(promises)
            .then(function (data) {
                ctrl.years = data[0];
                if (ctrl.yearId && ctrl.action == 'edit') {
                    ctrl.year = _.find(ctrl.years, function (y) {
                        return y.id == ctrl.yearId;
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
            if (!ctrl.year.title) {
                $dialogAlert("Kindly provide the year title.", "Missing Details");
                return;
            }

            $dialogConfirm(ctrl.action == "edit" ? "Update Record?" : "Add Record?", 'Confirm Transaction')
                .then(function () {
                    spinnerService.show('spinner1');
                    var updateProms = [];
                    if (ctrl.action == 'edit') {
                        updateProms.push(yearsSvc.UpdateItem(ctrl.year));
                    } else {
                        updateProms.push(yearsSvc.AddItem(ctrl.year));
                    }

                    $q
                        .all(updateProms)
                        .then(function (res) {
                            growl.success(ctrl.action == "edit" ? "Record updated successfully!" : "Record added successfully!");
                            $location.path("/listAdminYears");
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
                    yearsSvc
                        .DeleteItem(id)
                        .then(function (res) {
                            ctrl.years = res;
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
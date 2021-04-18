(function () {
    'use strict';

    angular
        .module('categories', [])
        .controller('categoriesCtrl', CategoriesCtrl);

    CategoriesCtrl.$inject = ['$q', '$dialogConfirm', '$dialogAlert', '$route', '$routeParams', '$location', 'planCategorySvc', 'spinnerService', 'UtilService', 'growl'];
    function CategoriesCtrl($q, $dialogConfirm, $dialogAlert, $route, $routeParams, $location, planCategorySvc, spinnerService, UtilService, growl) {
        var ctrl = this;
        ctrl.category = {};
        ctrl.action = $route.current.$$route.param;
        ctrl.links = UtilService.getAppShortcutlinks(5);
        ctrl.categoryId = $routeParams.id;
        ctrl.hostWebUrl = planCategorySvc.hostWebUrl;
        if (ctrl.action == 'list') {
            spinnerService.show('spinner1');
        }
        var promises = [];
        promises.push(planCategorySvc.getAllItems());

        $q
            .all(promises)
            .then(function (data) {
                ctrl.categories = data[0];
                if (ctrl.categoryId && ctrl.action == 'edit') {
                    ctrl.category = _.find(ctrl.categories, function (t) {
                        return t.id == ctrl.categoryId;
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
            if (!ctrl.category.title) {
                $dialogAlert("Kindly provide the category title.", "Missing Details");
                return;
            } else if (!ctrl.category.code) {
                $dialogAlert("Kindly provide the category code.", "Missing Details");
                return;
            } else if (!ctrl.category.abbr) {
                $dialogAlert("Kindly provide the category abbreviation.", "Missing Details");
                return;
            } else if (!ctrl.category.categoryno) {
                $dialogAlert("Kindly provide the category number.", "Missing Details");
                return;
            }

            $dialogConfirm(ctrl.action == "edit" ? "Update Record?" : "Add Record?", 'Confirm Transaction')
                .then(function () {
                    spinnerService.show('spinner1');
                    var updateProms = [];
                    if (ctrl.action == 'edit') {
                        updateProms.push(planCategorySvc.UpdateItem(ctrl.category));
                    } else {
                        updateProms.push(planCategorySvc.AddItem(ctrl.category));
                    }

                    $q
                        .all(updateProms)
                        .then(function (res) {
                            growl.success(ctrl.action == "edit" ? "Record updated successfully!" : "Record added successfully!");
                            $location.path("/listAdminCategories");
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
                    planCategorySvc
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
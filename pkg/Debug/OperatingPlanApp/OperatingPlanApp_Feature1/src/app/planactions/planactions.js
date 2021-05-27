(function () {
    'use strict';

    angular
        .module('planactions', [])
        .controller('planactionsCtrl', PlanActionsCtrlFunction);

    PlanActionsCtrlFunction.$inject = ['$q', '$routeParams', '$dialogAlert', 'settingsSvc', 'planCategorySvc', 'plansSvc', 'planActionsSvc', 'spinnerService', 'growl'];
    function PlanActionsCtrlFunction($q, $routeParams, $dialogAlert, settingsSvc, planCategorySvc, plansSvc, planActionsSvc, spinnerService, growl) {
        var ctrl = this;
        spinnerService.show('spinner1');

        ctrl.categoryimpact = 0;
        ctrl.categoryinfluence = 0;
        ctrl.categorycapacity = 0;
        ctrl.categoriesall = 0;

        var planid = parseInt($routeParams.planid);
        var status = $routeParams.status;

        ctrl.planactions = [];
        ctrl.isAdmin = false;

        ctrl.featureNotdeveloped = function () {
            growl.info("This feature is not fully developed yet. Check it out after a few hours/days for updates.");
        };

        var promises = [];
        promises.push(settingsSvc.checkIfCurrentUserIsAdmin());
        promises.push(planCategorySvc.getAllItems());
        promises.push(plansSvc.getAllItems());

        $q
            .all(promises)
            .then(function (results) {
                ctrl.isAdmin = results[0];
                ctrl.plancategories = results[1];
                ctrl.plans = results[2];

                if (planid) {
                    ctrl.plan = _.find(ctrl.plans, ['id', planid]);
                } else {
                    ctrl.plan = _.find(ctrl.plans, ['activeplan', true]);                    
                }

                planid = ctrl.plan ? ctrl.plan.id : 0;

                planActionsSvc
                    .getPlansSearched(planid, status)
                    .then(function (actions) {
                        ctrl.planactions = actions;
                        ctrl.categoriesall = ctrl.planactions.length;
                        ctrl.categoryimpact = LoadCategorySummary(ctrl.planactions, "PC001");
                        ctrl.categoryinfluence = LoadCategorySummary(ctrl.planactions, "PC002");
                        ctrl.categorycapacity = LoadCategorySummary(ctrl.planactions, "PC003");
                        ctrl.statuses = ["Active", "Suspended"];
                        status ? ctrl.status = status : ctrl.status = "";
                    })
                    .catch(function (error) {
                        growl.error(error);
                    });
            })
            .catch(function (error) {
                growl.error(error);
            })
            .finally(function () {
                spinnerService.closeAll();
            });

        function LoadCategorySummary(planactions, categorycode) {
            ctrl.planactions = planactions;
            ctrl.filterplanactions = _.cloneDeep(planactions);
            return _.filter(planactions, function (p) {
                return p.category.code == categorycode;
            }).length;
        }

        ctrl.getPlanActions = function (categorycode) {
            spinnerService.show('spinner1');
            ctrl.planactions = ctrl.filterplanactions;
            if (categorycode == "PC000") {
                ctrl.planactions = ctrl.filterplanactions;
            } else {
                ctrl.planactions = _.filter(ctrl.planactions, function (p) {
                    return p.category.code == categorycode;
                });
            }
            spinnerService.closeAll();
        };

        ctrl.searchPlanActions = function () {
            if (!ctrl.plan) {
                $dialogAlert("Kindly select the plan name.", "Missing Details");
                return;
            }
            spinnerService.show('spinner1');
            planActionsSvc
                .getPlansSearched(ctrl.plan.id, ctrl.status)
                .then(function (planactions) {
                    ctrl.planactions = planactions;
                    ctrl.categoriesall = planactions.length;
                    ctrl.categoryimpact = LoadCategorySummary(planactions, "PC001");
                    ctrl.categoryinfluence = LoadCategorySummary(planactions, "PC002");
                    ctrl.categorycapacity = LoadCategorySummary(planactions, "PC003");
                })
                .catch(function (error) {
                    growl.error(error);
                })
                .finally(function () {
                    spinnerService.closeAll();
                });
        };
    }
})();
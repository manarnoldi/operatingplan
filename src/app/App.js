(function () {
    'use strict';

    angular
        .module('app', ['ngRoute', 'ngAnimate', 'directives.dirPagination', 'ui.bootstrap', 'ui.bootstrap.dialogs', 'selectFile', 'services.utilities', 'spNgModule', 'sarsha.spinner',
            'angular-growl', 'sp-peoplepicker', 'datatables', 'angularjs-dropdown-multiselect', 'services.settings', 'services.plancategories', 'services.plans', 'services.planactions',
            'services.actiontargets', 'services.years', 'services.quarters', 'services.accountable', 'services.targetoutputs', 'services.outputprogress', 'services.teams', 'dir.adminmenu',
            'dir.backbtn', 'services.reports', 'services.qreviews', 'dir.addbtn', 'dir.adddocument', 'planactions', 'years', 'quarters', 'accountable', 'teams', 'categories', 'plans',
            'actions', 'planoutputs', 'settings', 'planaction'])
        .constant("IS_APP_WEB", false)
        .config(['growlProvider', GrowlProvider])
        .config(['$routeProvider', RouteProvider]);

    RouteProvider.$inject = ['$routeprovider'];
    function RouteProvider($routeprovider) {
        $routeprovider
            .when('/dashboard/:planid?/:status?', {
                templateUrl: 'app/planactions/planactions.tpl.html',
                controller: 'planactionsCtrl as ctrl',
            })
            .when('/updateAction/:id/:searchstatus?', {
                templateUrl: 'app/planaction/planaction-update.html',
                controller: 'planactionCtrl as ctrl',
                paramview: false
            })
            .when('/viewAction/:id/:searchstatus?', {
                templateUrl: 'app/planaction/planaction-update.html',
                controller: 'planactionCtrl as ctrl',
                paramview: true
            })
            .when('/searchOutputs', {
                templateUrl: 'app/planaction/planaction-outputs.html',
                controller: 'planoutputsCtrl as ctrl',
            })
            //Manage Admin Years
            .when('/listAdminYears', {
                templateUrl: 'app/adm-years/years-list.tpl.html',
                controller: 'yearsCtrl as ctrl',
                param: 'list'
            })
            .when('/addAdminYear', {
                templateUrl: 'app/adm-years/years-add.tpl.html',
                controller: 'yearsCtrl as ctrl',
                param: 'add'
            })
            .when('/editAdminYear/:id', {
                templateUrl: 'app/adm-years/years-add.tpl.html',
                controller: 'yearsCtrl as ctrl',
                param: 'edit'
            })
            //Manage Admin Quarters
            .when('/listAdminQuarters', {
                templateUrl: 'app/adm-quarters/quarters-list.tpl.html',
                controller: 'quartersCtrl as ctrl',
                param: 'list'
            })
            .when('/addAdminQuarter', {
                templateUrl: 'app/adm-quarters/quarters-add.tpl.html',
                controller: 'quartersCtrl as ctrl',
                param: 'add'
            })
            .when('/editAdminQuarter/:id', {
                templateUrl: 'app/adm-quarters/quarters-add.tpl.html',
                controller: 'quartersCtrl as ctrl',
                param: 'edit'
            })
            //Manage Accountable
            .when('/listAdminAccountable', {
                templateUrl: 'app/adm-accountable/accountable-list.tpl.html',
                controller: 'accountableCtrl as ctrl',
                param: 'list'
            })
            //Manage Admin Teams
            .when('/listAdminTeams', {
                templateUrl: 'app/adm-teams/teams-list.tpl.html',
                controller: 'teamsCtrl as ctrl',
                param: 'list'
            })
            //Manage Admin Categories
            .when('/listAdminCategories', {
                templateUrl: 'app/adm-categories/categories-list.tpl.html',
                controller: 'categoriesCtrl as ctrl',
                param: 'list'
            })
            .when('/addAdminCategory', {
                templateUrl: 'app/adm-categories/categories-add.tpl.html',
                controller: 'categoriesCtrl as ctrl',
                param: 'add'
            })
            .when('/editAdminCategory/:id', {
                templateUrl: 'app/adm-categories/categories-add.tpl.html',
                controller: 'categoriesCtrl as ctrl',
                param: 'edit'
            })
            //Manage Admin Plans
            .when('/listAdminPlans', {
                templateUrl: 'app/adm-plans/plans-list.tpl.html',
                controller: 'plansCtrl as ctrl',
                param: 'list'
            })
            .when('/addAdminPlan', {
                templateUrl: 'app/adm-plans/plans-add.tpl.html',
                controller: 'plansCtrl as ctrl',
                param: 'add'
            })
            .when('/editAdminPlan/:id', {
                templateUrl: 'app/adm-plans/plans-add.tpl.html',
                controller: 'plansCtrl as ctrl',
                param: 'edit'
            })
            //Manage Admin Actions
            .when('/listAdminActions/:planid?', {
                templateUrl: 'app/adm-actions/actions-list.tpl.html',
                controller: 'actionsCtrl as ctrl',
                param: 'list'
            })
            .when('/addAdminAction', {
                templateUrl: 'app/adm-actions/actions-add.tpl.html',
                controller: 'actionsCtrl as ctrl',
                param: 'add'
            })
            .when('/editAdminAction/:id', {
                templateUrl: 'app/adm-actions/actions-add.tpl.html',
                controller: 'actionsCtrl as ctrl',
                param: 'edit'
            })
            /*Admin System Settings */
            .when('/listAdminSettings', {
                templateUrl: 'app/adm-settings/settings-list.tpl.html',
                controller: 'settingsCtrl as ctrl',
                param: 'list'
            })
            .otherwise({
                redirectTo: '/dashboard'
            });
    }

    GrowlProvider.$inject = ['growlProvider'];
    function GrowlProvider(growlProvider) {
        growlProvider.globalTimeToLive({ success: 20000, error: -1, warning: 20000, info: 20000 });
        //growlProvider.globalTimeToLive(-1);
        growlProvider.globalDisableCountDown(true);
    }
})();
(function () {
    'use strict';

    angular
        .module('app', ['ngRoute', 'ngAnimate', 'directives.dirPagination', 'ui.bootstrap', 'ui.bootstrap.dialogs', 'selectFile', 'services.utilities', 'spNgModule', 'sarsha.spinner',
            'angular-growl', 'sp-peoplepicker', 'datatables', 'services.settings', 'services.plancategories', 'services.plans', 'services.planactions', 'services.actiontargets',
            'dir.backbtn', 'dir.addbtn', 'dir.adddocument', 'planactions', 'planaction'])
        .constant("IS_APP_WEB", false)
        .config(['growlProvider', GrowlProvider])
        .config(['$routeProvider', RouteProvider]);

    RouteProvider.$inject = ['$routeprovider'];
    function RouteProvider($routeprovider) {
        $routeprovider
            .when('/dashboard', {
                templateUrl: 'app/planactions/planactions.tpl.html',
                controller: 'planactionsCtrl as ctrl'
            })
            .when('/updateAction/:id', {
                templateUrl: 'app/planaction/planaction-update.html',
                controller: 'planactionCtrl as ctrl'
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
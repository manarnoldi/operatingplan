(function () {
    'use strict';

    angular
        .module('services.accountable', [])
        .service('accountableSvc', AccountableSvc);

    AccountableSvc.$inject = ['$q', 'ShptRestService'];
    function AccountableSvc($q, ShptRestService) {
        var svc = this;
        var listname = 'PlanAccountable';
        svc.userid = _spPageContextInfo.userId;
        var accountableList = null;
        svc.hostWebUrl = ShptRestService.hostWebUrl;

        svc.getAllItems = function () {
            var defer = $q.defer();
            var queryParams = "$select=Id,Title,Accountable/Id,Accountable/Title&$expand=Accountable";
            ShptRestService
                .getListItems(listname, queryParams)
                .then(function (data) {
                    accountableList = [];
                    _.forEach(data.results, function (o) {
                        var account = {};
                        account.id = o.Id;
                        account.title = o.Title;
                        account.accountable = o.Accountable.results;
                        accountableList.push(account);
                    });
                    defer.resolve(accountableList);
                })
                .catch(function (error) {
                    console.log(error);
                    defer.reject(error);
                });
            return defer.promise;
        };
    }
})();
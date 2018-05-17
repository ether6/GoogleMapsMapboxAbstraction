angular.module('module-GoogleMapsMapboxAbstraction')
.service('commonService', [
function () {

    var service = {
        loadScript
    };

    service.isMobile = {
        android: function() {
            return navigator.userAgent.match(/Android/i);
        },
        blackBerry: function() {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function() {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        opera: function() {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        windows: function() {
            return navigator.userAgent.match(/IEMobile/i);
        },
        any: function() {
            return (service.isMobile.android() || service.isMobile.blackBerry() || service.isMobile.iOS() || service.isMobile.opera() || service.isMobile.windows());
        }
    };

    return service;

    function loadScript(src, cacheBust) {
        return new Promise(function (resolve, reject) {
            var s;
            s = document.createElement('script');
            s.src = cacheBust ? `${ src }?${ Date.now() }` : src;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }

}]);

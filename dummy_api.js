/**
 * @namespace dummy_api
 */
const dummy_api = function dummy_api() {
    /**
     * @const
     * @type {flexi-log}
     */
    const logger = global.services.logger;

    /**
     * @const
     * @type {function}
     */
    const express = global.services.express;

    /**
     * @const
     * @type {sprintf}
     */
    const sprintf = global.services.sprintf;
    /**
     * Holds config data from yaml file.
     * @constant
     * @type {Array}
     */
    const appConfig = global.appConfig;

    global.logger = logger;

    logger.LOGGING_ENABLED =
        appConfig.get('app.debugging.enabled', false);
    logger.showOnly =
        appConfig.get('app.debugging.show_only', []);
    logger.ignore =
        appConfig.get('app.debugging.ignore', []);

    /**
     * @constant
     * @type {express.EventEmitter}
     * @description An isntance of express, for routing and other
     * framework functionality.
     */
    const app = global.services.app;

    logger.pushLabel("INIT");
    logger.log("Loading routes.");
    require('./app/routes/dummy_api_routes')(app, {});

    /**
     * Attaches to port specified in appConfig.port
     * @memberof dummy_api
     * @function
     */
    app.listen(global.appConfig.throw().get('app.port'), (()  => {
        logger.log(
            sprintf.sprintf(
                "Dummy API listening on port %s",
                appConfig.throw().get('app.port')
            )
        );
        logger.popLabel();
    }));
};

module.exports = dummy_api;
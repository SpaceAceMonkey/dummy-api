/**
 * Build a tree of alias routes
 *
 * @param {object} alias_configuration Routes.aliases configuration from
 * configuration file
 * @return {object} Tree of alias routes, and the "real" routes and methods
 * they point to.
 */
const build_route_aliases = function(alias_configuration) {
    const logger = global.services.logger;
    const sprintf = global.services.sprintf;

    logger.pushLabel("ALIAS");
    logger.log("Building route list with aliases.")

    const allowed_methods = ['delete', 'get', 'head', 'patch', 'post', 'put'];
    const default_route_category_mappings = {
        true: 'boolean',
        false: 'boolen',
        truefalse: 'random_boolean',
        mirror: 'mirror',
        http_code: 'http_code'
    };
    const allowed_routes = ['true', 'false', 'truefalse', 'mirror', 'responsecode'];
    const required_routes = {
        delete: {
            boolean: ['/true', '/false'],
            random_boolean: ['/truefalse'],
            mirror: ['/mirror'],
            http_code: ['/http_code']
        },
        get: {
            boolean: ['/true', '/false'],
            random_boolean: ['/truefalse'],
            mirror: ['/mirror'],
            http_code: ['/http_code']
        },
        head: {
            boolean: ['/true', '/false'],
            random_boolean: ['/truefalse'],
            mirror: ['/mirror'],
            http_code: ['/http_code']
        },
        patch: {
            boolean: ['/true', '/false'],
            random_boolean: ['/truefalse'],
            mirror: ['/mirror'],
            http_code: ['/http_code']
        },
        post: {
            boolean: ['/true', '/false'],
            random_boolean: ['/truefalse'],
            mirror: ['/mirror'],
            http_code: ['/http_code']
        },
        put: {
            boolean: ['/true', '/false'],
            random_boolean: ['/truefalse'],
            mirror: ['/mirror'],
            http_code: ['/http_code']
        }
    };

    const strip_leading_slashes_regex = /^\/+/;
    const routes = {};
    allowed_methods.forEach((method_key, index) => {
        logger.log(sprintf.sprintf("Processing '%s' routes", method_key))
        routes[method_key] = [];

        const complete_alias_configuration = JSON.parse(JSON.stringify(alias_configuration));
        const required_route_keys = Object.keys(required_routes);
        required_route_keys.forEach((key, index) => {
            if (complete_alias_configuration[key] === undefined) {
console.log(key + " not defined")
            }
        });
        Object.keys(complete_alias_configuration).forEach((route_target, route_target_index) => {
            const valid_route_target = route_target.replace(strip_leading_slashes_regex, '').toLowerCase();
            const this_method_routes = [];
            this_method_routes.push('/' + valid_route_target);

            try {
                if (!allowed_routes.includes(valid_route_target)) {
                    throw new Error(
                        sprintf.sprintf("You have attempted to create an alias to non-existent route '%s'", valid_route_target)
                    );
                }
    
                logger.log(sprintf.sprintf("Processing route '%s'", valid_route_target));

                const aliases = complete_alias_configuration[route_target];
                if (Object.prototype.toString.call(aliases) === '[object Object]') {
                    Object.keys(aliases).forEach((alias_key, alias_index) => {
                        const valid_alias_key = alias_key.replace(strip_leading_slashes_regex, '');
                        logger.log(sprintf.sprintf("Adding alias '/%s', pointing to '/%s'", valid_alias_key, valid_route_target));
                        const alias_methods = aliases[alias_key];
                        if (Array.isArray(alias_methods)) {
                            alias_methods.forEach((alias_method_key, alias_method_index) => {
                                if (alias_method_key.toLowerCase() === method_key) {
                                    this_method_routes.push('/' + valid_alias_key);
                                }
                            });
                        }
                    });
                }
            }
            catch (exception) {
                logger.pushLabel("EXCEPTION");
                logger.log(exception.message);
                logger.popLabel();
            }

            routes[method_key].push(this_method_routes);
        });
    });

    logger.popLabel();
    console.dir(routes);
};

/**
 * Manages dummy API routes
 *
 * @param {function} app  An instance of express
 * @param {*} db
 */
module.exports = function(app, db) {
    const logger = global.services.logger;
    const router = global.services.express.Router();
    const sprintf = global.services.sprintf;
    const appConfig = global.appConfig;

    logger.pushLabel("ROUTING");

    build_route_aliases(appConfig.get('routes.aliases', {}), logger)

    router.use('/*', (req, res, next) => {

        logger.log(
            sprintf.sprintf(
                "Received request of type %s, with data of type %s",
                req.method,
                req.headers['content-type']
            )
        );

        if (req.headers['content-type-override']) {
            logger.log(
                sprintf.sprintf(
                    "Overriding content-type with %s.",
                    req.headers['content-type-override']
                )
            );

            res.set(
                'content-type',
                req.headers['content-type-override']
            );
        }

        next();
    });
    router.use('/mirror', (req, res, next) => {
        logger.log("Passing to mirror_route().")
        logger.pushLabel("MIRROR");
        next();
        logger.popLabel();
    });
    router.use(['/true', '/false'], (req, res, next) => {
        logger.log("Passing to boolean_route().")
        logger.pushLabel("BOOLEAN");
        next();
        logger.popLabel();
    });
    router.use('/truefalse', (req, res, next) => {
        logger.log("Passing to random_boolean_route().")
        logger.pushLabel("RAND_BOOL");
        next();
        logger.popLabel();
    });
    router.use('/responsecode', (req, res, next) => {
        logger.log("Passing to http_response_code_route().")
        logger.pushLabel("HTTP_CODE");
        next();
        logger.popLabel();
    });
    app.use('/', router);

    app.delete('/true', (req, res) => {
        boolean_route(res, true);
    });
    app.get('/true', (req, res) => {
        boolean_route(res, true);
    });
    app.head('/true', (req, res) => {
        boolean_route(res, true);
    });
    app.patch('/true', (req, res) => {
        boolean_route(res, true);
    });
    app.post('/true', (req, res) => {
        boolean_route(res, true);
    });
    app.put('/true', (req, res) => {
        boolean_route(res, true);
    });

    app.delete('/false', (req, res) => {
        boolean_route(res, false);
    });
    app.get('/false', (req, res) => {
        boolean_route(res, false);
    });
    app.head('/false', (req, res) => {
        boolean_route(res, false);
    });
    app.patch('/false', (req, res) => {
        boolean_route(res, false);
    });
    app.post('/false', (req, res) => {
        boolean_route(res, false);
    });
    app.put('/false', (req, res) => {
        boolean_route(res, false);
    });

    app.delete('/truefalse', (req, res) => {
        random_boolean_route(res);
    });
    app.get('/truefalse', (req, res) => {
        random_boolean_route(res);
    });
    app.head('/truefalse', (req, res) => {
        random_boolean_route(res);
    });
    router.patch('/truefalse', (req, res) => {
        random_boolean_route(res);
    });
    router.post('/truefalse', (req, res) => {
        random_boolean_route(res);
    });
    app.put('/truefalse', (req, res) => {
        random_boolean_route(res);
    });

    app.delete('/mirror', (req, res) => {
        mirror_route(req, res);
    });
    app.get('/mirror', (req, res) => {
        mirror_route(req, res);
    });
    app.head('/mirror', (req, res) => {
        mirror_route(req, res);
    });
    app.patch('/mirror', (req, res) => {
        mirror_route(req, res);
    });
    app.post('/mirror', (req, res) => {
        mirror_route(req, res);
    });
    app.put('/mirror', (req, res) => {
        mirror_route(req, res);
    });

    app.delete('/responsecode/:http_code([1-5][0-9]{2})', (req, res) => {
        http_response_code_route(req, res);
    });
    app.get('/responsecode/:http_code([1-5][0-9]{2})', (req, res) => {
        http_response_code_route(req, res);
    });
    app.head('/responsecode/:http_code([1-5][0-9]{2})', (req, res) => {
        http_response_code_route(req, res);
    });
    app.patch('/responsecode/:http_code([1-5][0-9]{2})', (req, res) => {
        http_response_code_route(req, res);
    });
    app.post('/responsecode/:http_code([1-5][0-9]{2})', (req, res) => {
        http_response_code_route(req, res);
    });
    app.put('/responsecode/:http_code([1-5][0-9]{2})', (req, res) => {
        http_response_code_route(req, res);
    });

    logger.popLabel();

    /**
     * @description Returns a single boolean value as the response.
     * @param {ServerResponse} res
     * @param {boolean} value
     */
    function boolean_route(res, value) {
        logger.pushLabel("BOOLEAN");
        logger.log("Returning boolean value " + value);
        logger.popLabel();
        res.send(value);
    }

    /**
     * @description Selects randomly from [true, false] before
     * calling boolean_route() with the selected value.
     * @param {ServerResponse} res
     */
    function random_boolean_route(res) {
        const options = [true, false];
        const selected =
            options[Math.floor(Math.random() * options.length)];
        boolean_route(res, selected);
    }
    /**
     * @description Returns the request body to the client
     * as the response body
     * @param {IncomingMessage} req
     * @param {ServerResponse} res
     */
    function mirror_route(req, res) {
        const content_type = req.headers['content-type'];
        logger.log(
            sprintf.sprintf(
                "Received body of '%j'",
                (
                    req.method === 'GET'
                        ? req.query
                        : req.body
                )
            )
        );

        const response_body = (() => {
            let request_body;
            if (req.method === 'GET') {
                request_body = req.query;
            } else {
                if (typeof req.body === 'object') {
                    request_body = JSON.stringify(req.body);
                } else {
                    request_body = req.body;
                }
            }

            return request_body;
        })();

        logger.log(
            sprintf.sprintf(
                "Returning request body to client."
            )
        );

        res.send(response_body);
    }

    /**
     * @description Returns an empty body with the specified HTTP code
     * @param {IncomingMessage} req
     * @param {ServerResponse} res
     */
    function http_response_code_route(req, res) {
        const http_code = parseInt(req.params.http_code);
        logger.log(sprintf.sprintf("Returning response with HTTP code %s", http_code))
        res.status(http_code)
        res.send("");
    }
};


const allowed_methods = ['delete', 'get', 'head', 'patch', 'post', 'put'];
const allowed_routes = ['true', 'false', 'truefalse', 'mirror', 'responsecode'];

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
    logger.log("Building route list with aliases.");

    const routes = {};
    allowed_methods.forEach((method_key, index) => {
        logger.log(sprintf.sprintf("Processing '%s' routes", method_key));
        routes[method_key] = {};

        const alias_configuration_local = JSON.parse(JSON.stringify(alias_configuration));

        Object.keys(alias_configuration_local).forEach((route_target, route_target_index) => {
            const valid_route_target = stripLeadingSlashes(route_target).toLowerCase();
            const this_method_routes = [];

            try {
                if (!allowed_routes.includes(valid_route_target)) {
                    throw new Error(
                        sprintf.sprintf("You have attempted to create an alias to non-existent route '%s'", valid_route_target)
                    );
                }
    
                logger.log(sprintf.sprintf("Processing route '%s'", valid_route_target));

                const aliases = alias_configuration_local[route_target];
                if (Object.prototype.toString.call(aliases) === '[object Object]') {
                    Object.keys(aliases).forEach((alias_key, alias_index) => {
                        const valid_alias_key = stripLeadingSlashes(alias_key);
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

            routes[method_key][valid_route_target] = this_method_routes;
        });
    });

    logger.popLabel();
    // logger.log(sprintf.sprintf("Routes: %j", routes));
    // logger.log(sprintf.sprintf("Routes: %j", routes.delete));

    return routes;
};

/**
 * Remove the leading slash(es), if any, from a string, and
 * return the result
 * .
 * @param {string} string_to_modify 
 */
function stripLeadingSlashes(string_to_modify) {
    const strip_leading_slashes_regex = /^\/+/;
    const modified_string = string_to_modify.replace(strip_leading_slashes_regex, '');

    return modified_string;
}
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
    const organized_alias_routes =
        new (require('object-descender'))(build_route_aliases(appConfig.get('routes.aliases', {}), logger));

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

    const unique_aggregate_alias_routes = {};
    logger.log(sprintf.sprintf('%j', organized_alias_routes.data_object));
    allowed_routes.forEach((allowed_route_key, allowed_route_index) => {
        const aggregate_alias_routes = [];
        logger.log("Adding '/" + allowed_route_key + "' routes.");
        aggregate_alias_routes[allowed_route_key] = [];
        allowed_methods.forEach((allowed_method_key, allowed_method_index) => {
            aggregate_alias_routes[allowed_route_key] = aggregate_alias_routes[allowed_route_key].concat(
                organized_alias_routes.get(allowed_method_key + '.' + allowed_route_key, [])
            );
        });

        unique_aggregate_alias_routes[allowed_route_key] = aggregate_alias_routes.filter((element, index) => {
            return true;
        });
        console.log("UA = " + JSON.stringify(unique_aggregate_alias_routes))
    });

    // const unique_aggregate_alias_routes = aggregate_alias_routes.filter((element, position) => {
    //     const result = 
    // });
    logger.log(sprintf.sprintf('%j', unique_aggregate_alias_routes));
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

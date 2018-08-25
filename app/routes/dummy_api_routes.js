const allowed_methods = ['delete', 'get', 'head', 'patch', 'post', 'put'];
const allowed_routes = ['true', 'false', 'truefalse', 'mirror', 'responsecode'];
const route_options = {
    responsecode: ":http_code([1-5][0-9]{2})"
};

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
                        const alias_methods =
                            Array.isArray(aliases[alias_key]) && aliases[alias_key].length <= 0
                            ? allowed_methods
                            : aliases[alias_key];
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

    /**************************************
     * Ridiculous
     */
    const route_handlers = {
        true: (req, res) => {
            boolean_route(res, true);
        },
        false: (req, res) => {
            boolean_route(res, false);
        },
        truefalse: (req, res) => {
            random_boolean_route(res);
        },
        mirror: (req, res) => {
            mirror_route(req, res);
        },
        responsecode: (req, res) => {
            http_response_code_route(req, res);
        }
    };

    const unique_aggregate_alias_routes = {};
    allowed_routes.forEach((allowed_route_key, allowed_route_index) => {
        logger.log("Adding '/" + allowed_route_key + "' routes.");
        unique_aggregate_alias_routes[allowed_route_key] = [];
        allowed_methods.forEach((allowed_method_key, allowed_method_index) => {
            unique_aggregate_alias_routes[allowed_route_key] = unique_aggregate_alias_routes[allowed_route_key].concat(
                organized_alias_routes.get(allowed_method_key + '.' + allowed_route_key, [])
            );
            unique_aggregate_alias_routes[allowed_route_key] = unique_aggregate_alias_routes[allowed_route_key]
                .filter((alias_route, alias_route_index) => {
                    return unique_aggregate_alias_routes[allowed_route_key].indexOf(alias_route) === alias_route_index;
                }
            );
            const this_route_options = (
                route_options[allowed_route_key]
                    ? '/' + stripLeadingSlashes(route_options[allowed_route_key])
                    : ''
            );
            app[allowed_method_key](
                ['/' + allowed_route_key + this_route_options]
                .concat(
                    organized_alias_routes.get(
                        allowed_method_key + '.' + allowed_route_key, []
                    ).map((alias_route, alias_index) => {
                        return alias_route + this_route_options
                    })
                ),
                route_handlers[allowed_route_key]
            );
        });
    });

    /**
     * This is OK, for now. If I add more base routes, I will probably
     * automate it the way I did the rest of the alias code, above.
     */
    router.use(
        ['/mirror'].concat(unique_aggregate_alias_routes.mirror),
        (req, res, next) => {
            logger.log("Passing to mirror_route().")
            logger.pushLabel("MIRROR");
            next();
            logger.popLabel();
        }
    );
    router.use(
        ['/true', '/false'].concat(
            unique_aggregate_alias_routes.true,
            unique_aggregate_alias_routes.false
        ),
        (req, res, next) => {
            logger.log("Passing to boolean_route().")
            logger.pushLabel("BOOLEAN");
            next();
            logger.popLabel();
        }
    );
    router.use(
        ['/truefalse'].concat(unique_aggregate_alias_routes.truefalse),
        (req, res, next) => {
            logger.log("Passing to random_boolean_route().")
            logger.pushLabel("RAND_BOOL");
            next();
            logger.popLabel();
        }
    );
    router.use(
        ['/responsecode'].concat(unique_aggregate_alias_routes.responsecode),
        (req, res, next) => {
            logger.log("Passing to http_response_code_route().")
            logger.pushLabel("HTTP_CODE");
            next();
            logger.popLabel();
        }
    );
    /**
     *
     *************************************/

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

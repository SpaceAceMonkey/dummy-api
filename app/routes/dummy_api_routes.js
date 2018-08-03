/**
 * 
 * @param {express app} app 
 * @param {*} db 
 */
module.exports = function(app, db) {
    const logger = global.services.logger;
    const router = global.services.express.Router();
    const sprintf = global.services.sprintf;

    router.use('/*', (req, res, next) => {
        logger.pushLabel("ROUTING");
        logger.log(
            sprintf.sprintf(
                "Received request of type %s, with data of type %s",
                req.method,
                req.headers['content-type']
            )
        );
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
    app.post('/false', (req, res) => {
        boolean_route(res, false);
    });
    app.put('/false', (req, res) => {
        boolean_route(res, false);
    });

    app.delete('/truefalse', (req, res) => {
        const options = [true, false];
        const selected = 
            options[Math.floor(Math.random() * options.length)];
        boolean_route(res, selected);
    });
    app.get('/truefalse', (req, res) => {
        const options = [true, false];
        const selected = 
            options[Math.floor(Math.random() * options.length)];
        boolean_route(res, selected);
    });
    router.post('/truefalse', (req, res) => {
        const options = [true, false];
        const selected = 
            options[Math.floor(Math.random() * options.length)];
        boolean_route(res, selected);
    });
    app.put('/truefalse', (req, res) => {
        const options = [true, false];
        const selected = 
            options[Math.floor(Math.random() * options.length)];
        boolean_route(res, selected);
    });

    app.post('/mirror', (req, res) => {
        mirror_route(req, res);
    });

    function boolean_route(res, value) {
        logger.log("Passed to boolean_route.");
        logger.pushLabel("BOOLEAN");
        logger.log("Returning boolean value " + value);
        logger.popLabel();
        res.send(value);
    }
    
    /**
     * @description Returns the request body as the response body
     * @function
     * @param {IncomingMessage} req 
     * @param {ServerResponse} res 
     */
    function mirror_route(req, res) {
        const content_type = req.headers['content-type'];
        logger.log(sprintf.sprintf("Mirror received %j", req.body));
        const body = (() => {
            let body;
            if (typeof req.body === 'object') {
                body = JSON.stringify(req.body);
            } else {
                body = req.body;
            }

            return body;
        })();
        logger.log("Returning request body to client.")
        res.send(body);
    }

    function html_code_route(req, res) {

    }
};


module.exports = function logger(req, res, next) {
    const start = Date.now();
    const { method, originalUrl } = req;

    res.on('finish', () => {
        const ms = Date.now() - start;
        console.log(`${method} ${originalUrl} -> ${res.statusCode} (${ms}ms)`);
    });

    next();
};

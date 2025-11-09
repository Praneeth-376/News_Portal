const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
};

const requestLogger = (req, res, next) => {
  const oldSend = res.send;
  res.send = function(data) {
    console.log(`[${new Date().toISOString()}] Response sent: ${res.statusCode}`);
    oldSend.apply(res, arguments);
  };
  next();
};

module.exports = { logger, requestLogger };
const jwt = require("jsonwebtoken");
const logger = require("./logger");

const requestLogger = (req, res, next) => {
  logger.info("Method:", req.method);
  logger.info("Path:", req.path);
  logger.info("Body:", req.body);
  logger.info("_________");
  next();
};

const unKnownEndPoint = (req, res) => {
  res.status(404).send({ error: "unknown end point" });
};

const errorHandler = (error, req, res, next) => {
  logger.error(error.message);
  if (error.name === "CastError") {
    return res.status(400).send({ error: "malformed id" });
  } else if (error.name === "ValidationError") {
    return res.status(400).send({ error: error.message });
  } else if (
    error.name === "MongoServerError" &&
    error.message.includes("E11000 duplicate key error")
  ) {
    return res.status(400).json({ error: "expected `username` to be unique" });
  } else if (error.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "token invalid" });
  } else if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      error: "token expired",
    });
  }
  next(error);
};
const getTokenFrom = (req, res, next) => {
  const authorization = req.get("authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    req.token = authorization.replace("Bearer ", "");
  } else {
    req.token = null;
  }

  next();
};
const userExtractor = (req, res, next) => {
  if (req.token) {
    const decodedToken = jwt.verify(req.token, process.env.SECRET);
    if (decodedToken.id) {
      req.user = decodedToken;
    }
  }
  next();
};

module.exports = {
  unKnownEndPoint,
  errorHandler,
  requestLogger,
  getTokenFrom,
  userExtractor,
};

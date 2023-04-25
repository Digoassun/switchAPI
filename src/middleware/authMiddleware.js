const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth) {
    return res.status(130).json({ error: true, msg: "Token de autenticação não existe" });
  }

  // Spliting token "bearer --token--"
  const [, token] = auth.split(" ");
  try {
    jwt.verify(token, process.env.SECRET);
    next();
  } catch (err) {
    return res.status(400).json({ msg: "Token inválido" });
  }
};

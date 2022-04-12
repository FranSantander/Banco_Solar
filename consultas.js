const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  password: "postgresql",
  database: "bancosolar",
  port: 5432,
});
const guardarUsuario = async (usuario) => {
  const values = Object.values(usuario);
  const consulta = {
    text: "INSERT INTO usuarios ( nombre, balance) values ($1, $2) RETURNING *",
    values,
  };
  try {
    const result = await pool.query(consulta);
    return result;
  } catch (error) {
    console.log(error.code);
    return error;
  }
};

const getUsuarios = async () => {
  try {
    const result = await pool.query("SELECT * FROM usuarios;");
    return result.rows;
  } catch (error) {
    console.log(error.code);
    return error;
  }
};
const editUsuario = async (usuario, id) => {
  console.log(usuario, id);
  const values = Object.values(usuario);
  const consulta = {
    text: `UPDATE usuarios SET nombre = $2, balance = $3 WHERE id = ${1} RETURNING *`,
    values,
  };
  try {
    const result = await pool.query(consulta);
    return result;
  } catch (error) {
    console.log(error.code);
  }
};

module.exports = { guardarUsuario, getUsuarios, editUsuario };

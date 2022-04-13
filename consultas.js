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
    text: "INSERT INTO usuarios (nombre, balance) values ($1, $2) RETURNING *",
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
    text: `UPDATE usuarios SET nombre = $2, balance = $3 WHERE id = $1 RETURNING *`,
    values,
  };
  try {
    const result = await pool.query(consulta);
    return result;
  } catch (error) {
    console.log(error.code);
  }
};
const eliminarUsuario = async (id) => {
  try {
    const result = await pool.query(`DELETE FROM usuarios WHERE id = ${id}`);
    return result.rows;
  } catch (error) {
    console.log(error.code);
  }
};
const registrarTransferencias = async (transferencia) => {
  console.log(transferencia);
  const values = Object.values(transferencia);

  const actualizarBalanceEmisor = {
    
    text: "UPDATE usuarios SET balance = balance - $2 WHERE id = $1 RETURNING *;",
    values: [values[0], Number(values[1])],
    
  };

  const actualizarBalanceReceptor = {
    text: "UPDATE usuarios SET balance = balance + $2 WHERE id = $1 RETURNING *;",
    values: [values[1], Number(values[2])],
  };
  const registroTransferencia = {
    text: "INSERT INTO transferencias (emisor, receptor, monto, fecha) values ($1, $2, $3, $4);",
    values,
  };

  try {
    await pool.query("BEGIN");
    await pool.query(registroTransferencia);
    console.log("Se esta realizando la transferencia");
    await pool.query(actualizarBalanceEmisor);
    console.log("Actualizando cuenta del emisor");
    await pool.query(actualizarBalanceReceptor);
    console.log("Actualizando cuenta del receptor");
    await pool.query("COMMIT");
    return true;
  } catch (error) {
    await pool.query("ROLLBACK");
    console.log(
      "No se pudo realizar la transacción.",
      "Error de código: ",
      error.code
    );
    return error;
  }
};

module.exports = {
  guardarUsuario,
  getUsuarios,
  editUsuario,
  eliminarUsuario,
  registrarTransferencias,
};
